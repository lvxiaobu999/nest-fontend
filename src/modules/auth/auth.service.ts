import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { SafeUser, UsersService } from '../users/users.service';
import { AuthSessionService } from './auth-session.service';
import { LoginDto } from './dto/login.dto';

const INVALID_LOGIN_CREDENTIALS_CODE = 10001;

const authMenuSelect = Prisma.validator<Prisma.MenuSelect>()({
  id: true,
  parentId: true,
  path: true,
  title: true,
  icon: true,
  order: true,
  keepAlive: true,
  hidden: true,
  isLogin: true,
  disabled: true,
  enabled: true,
  createTime: true,
  updateTime: true,
});

const authPermissionSelect = Prisma.validator<Prisma.PermissionSelect>()({
  id: true,
  name: true,
  code: true,
  remark: true,
  enabled: true,
  menuId: true,
  createTime: true,
  updateTime: true,
});

type AuthMenuRecord = Prisma.MenuGetPayload<{ select: typeof authMenuSelect }>;
type AuthPermissionRecord = Prisma.PermissionGetPayload<{ select: typeof authPermissionSelect }>;

export interface AuthMenuTreeNode extends AuthMenuRecord {
  children: AuthMenuTreeNode[];
}

export interface AuthProfileResponse {
  user: SafeUser;
  menus: AuthMenuTreeNode[];
  permissions: string[];
}

export interface LoginResponse extends AuthProfileResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  // 登录时先校验用户名密码，再签发 JWT 并把当前会话写入 Redis。
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.validateLogin(loginDto.username, loginDto.password);

    if (!user) {
      throw new BusinessException('用户名或密码错误', INVALID_LOGIN_CREDENTIALS_CODE);
    }

    const session = await this.authSessionService.createSession(user);
    const profile = await this.buildAuthProfile(user);

    return {
      ...profile,
      accessToken: session.accessToken,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn,
    };
  }

  async getProfile(userId: string): Promise<AuthProfileResponse> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.buildAuthProfile(user);
  }

  // 退出登录时删除 Redis 会话，让当前 JWT 立即失效。
  async logout(sessionId: string): Promise<{ loggedOut: true }> {
    await this.authSessionService.removeSession(sessionId);

    return { loggedOut: true };
  }

  private async buildAuthProfile(user: SafeUser): Promise<AuthProfileResponse> {
    const { menus, permissions } = await this.getAuthorizationResources(user);

    return {
      user,
      menus: this.buildMenuTree(menus),
      permissions: permissions.map((permission) => permission.code),
    };
  }

  private async getAuthorizationResources(user: SafeUser): Promise<{
    menus: AuthMenuRecord[];
    permissions: AuthPermissionRecord[];
  }> {
    if (user.isSuperAdmin === 1) {
      const [menus, permissions] = await Promise.all([
        this.prismaService.menu.findMany({
          where: {
            enabled: 1,
          },
          select: authMenuSelect,
          orderBy: [{ order: 'asc' }, { createTime: 'asc' }],
        }),
        this.prismaService.permission.findMany({
          where: {
            enabled: 1,
          },
          select: authPermissionSelect,
          orderBy: [{ createTime: 'asc' }],
        }),
      ]);

      return {
        menus,
        permissions,
      };
    }

    if (!user.roleId) {
      return {
        menus: [],
        permissions: [],
      };
    }

    const role = await this.prismaService.role.findUnique({
      where: { id: user.roleId },
      select: {
        menus: {
          where: {
            enabled: 1,
          },
          select: authMenuSelect,
          orderBy: [{ order: 'asc' }, { createTime: 'asc' }],
        },
        permissions: {
          where: {
            enabled: 1,
          },
          select: authPermissionSelect,
          orderBy: [{ createTime: 'asc' }],
        },
      },
    });

    if (!role) {
      return {
        menus: [],
        permissions: [],
      };
    }

    return {
      menus: await this.withMenuAncestors(role.menus),
      permissions: role.permissions,
    };
  }

  private async withMenuAncestors(menus: AuthMenuRecord[]): Promise<AuthMenuRecord[]> {
    const menuMap = new Map(menus.map((menu) => [menu.id, menu]));
    let pendingParentIds = this.collectMissingParentIds(menuMap);

    while (pendingParentIds.length > 0) {
      const parents = await this.prismaService.menu.findMany({
        where: {
          id: { in: pendingParentIds },
          enabled: 1,
        },
        select: authMenuSelect,
      });

      parents.forEach((parent) => {
        menuMap.set(parent.id, parent);
      });

      pendingParentIds = this.collectMissingParentIds(menuMap);
    }

    return Array.from(menuMap.values()).sort((left, right) => this.compareMenus(left, right));
  }

  private collectMissingParentIds(menuMap: Map<string, AuthMenuRecord>): string[] {
    const parentIds = new Set<string>();

    menuMap.forEach((menu) => {
      if (menu.parentId && !menuMap.has(menu.parentId)) {
        parentIds.add(menu.parentId);
      }
    });

    return Array.from(parentIds);
  }

  private buildMenuTree(menus: AuthMenuRecord[]): AuthMenuTreeNode[] {
    const menuNodeMap = new Map<string, AuthMenuTreeNode>(
      menus.map((menu) => [
        menu.id,
        {
          ...menu,
          children: [],
        },
      ]),
    );
    const roots: AuthMenuTreeNode[] = [];

    menuNodeMap.forEach((menu) => {
      if (menu.parentId) {
        const parent = menuNodeMap.get(menu.parentId);

        if (parent) {
          parent.children.push(menu);
          return;
        }
      }

      roots.push(menu);
    });

    this.sortMenuNodes(roots);
    return roots;
  }

  private sortMenuNodes(menus: AuthMenuTreeNode[]): void {
    menus.sort((left, right) => this.compareMenus(left, right));
    menus.forEach((menu) => {
      if (menu.children.length > 0) {
        this.sortMenuNodes(menu.children);
      }
    });
  }

  private compareMenus(left: Pick<AuthMenuRecord, 'order' | 'createTime'>, right: Pick<AuthMenuRecord, 'order' | 'createTime'>): number {
    const leftOrder = left.order ?? 0;
    const rightOrder = right.order ?? 0;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.createTime.getTime() - right.createTime.getTime();
  }
}
