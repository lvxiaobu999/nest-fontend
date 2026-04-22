import { Test, TestingModule } from '@nestjs/testing';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    validateLogin: jest.fn(),
    findOne: jest.fn(),
  };
  const authSessionService = {
    createSession: jest.fn(),
    removeSession: jest.fn(),
  };
  const prismaService = {
    menu: {
      findMany: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return token and safe user info when credentials are valid', async () => {
    const safeUser = {
      id: 'user-1',
      username: 'demo-admin',
      isSuperAdmin: 1,
      roleId: null,
      nickname: '演示管理员',
      enabled: 1,
      remark: 'test',
      createTime: new Date('2026-04-21T00:00:00.000Z'),
      updateTime: new Date('2026-04-21T00:00:00.000Z'),
    };

    usersService.validateLogin.mockResolvedValue(safeUser);
    authSessionService.createSession.mockResolvedValue({
      accessToken: 'jwt-token',
      expiresIn: 7200,
      sessionId: 'session-1',
    });
    prismaService.menu.findMany.mockResolvedValue([
      {
        id: 'menu-1',
        parentId: null,
        path: '/dashboard',
        title: 'Dashboard',
        icon: 'dashboard',
        order: 1,
        keepAlive: false,
        hidden: false,
        isLogin: true,
        disabled: false,
        enabled: 1,
        createTime: new Date('2026-04-21T00:00:00.000Z'),
        updateTime: new Date('2026-04-21T00:00:00.000Z'),
      },
    ]);
    prismaService.permission.findMany.mockResolvedValue([
      {
        id: 'permission-1',
        name: 'Dashboard View',
        code: 'dashboard:view',
        remark: 'test',
        enabled: 1,
        menuId: 'menu-1',
        createTime: new Date('2026-04-21T00:00:00.000Z'),
        updateTime: new Date('2026-04-21T00:00:00.000Z'),
      },
    ]);

    await expect(
      service.login({
        username: 'demo-admin',
        password: '123456',
      }),
    ).resolves.toEqual({
      user: safeUser,
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: 7200,
      menus: [
        {
          id: 'menu-1',
          parentId: null,
          path: '/dashboard',
          title: 'Dashboard',
          icon: 'dashboard',
          order: 1,
          keepAlive: false,
          hidden: false,
          isLogin: true,
          disabled: false,
          enabled: 1,
          createTime: new Date('2026-04-21T00:00:00.000Z'),
          updateTime: new Date('2026-04-21T00:00:00.000Z'),
          children: [],
        },
      ],
      permissions: ['dashboard:view'],
    });
  });

  it('should throw business exception when credentials are invalid', async () => {
    usersService.validateLogin.mockResolvedValue(null);

    await expect(
      service.login({
        username: 'demo-admin',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(BusinessException);
  });

  it('should return profile with role menus and permissions', async () => {
    const safeUser = {
      id: 'user-2',
      username: 'editor',
      isSuperAdmin: 0,
      roleId: 'role-1',
      nickname: '编辑员',
      enabled: 1,
      remark: null,
      createTime: new Date('2026-04-21T00:00:00.000Z'),
      updateTime: new Date('2026-04-21T00:00:00.000Z'),
    };

    usersService.findOne.mockResolvedValue(safeUser);
    prismaService.role.findUnique.mockResolvedValue({
      menus: [
        {
          id: 'menu-child',
          parentId: 'menu-root',
          path: '/system/user',
          title: '用户管理',
          icon: 'user',
          order: 2,
          keepAlive: false,
          hidden: false,
          isLogin: true,
          disabled: false,
          enabled: 1,
          createTime: new Date('2026-04-21T00:00:01.000Z'),
          updateTime: new Date('2026-04-21T00:00:01.000Z'),
        },
      ],
      permissions: [
        {
          id: 'permission-2',
          name: 'User List',
          code: 'user:list',
          remark: null,
          enabled: 1,
          menuId: 'menu-child',
          createTime: new Date('2026-04-21T00:00:01.000Z'),
          updateTime: new Date('2026-04-21T00:00:01.000Z'),
        },
      ],
    });
    prismaService.menu.findMany.mockResolvedValue([
      {
        id: 'menu-root',
        parentId: null,
        path: '/system',
        title: '系统管理',
        icon: 'setting',
        order: 1,
        keepAlive: false,
        hidden: false,
        isLogin: true,
        disabled: false,
        enabled: 1,
        createTime: new Date('2026-04-21T00:00:00.000Z'),
        updateTime: new Date('2026-04-21T00:00:00.000Z'),
      },
    ]);

    await expect(service.getProfile('user-2')).resolves.toEqual({
      user: safeUser,
      menus: [
        {
          id: 'menu-root',
          parentId: null,
          path: '/system',
          title: '系统管理',
          icon: 'setting',
          order: 1,
          keepAlive: false,
          hidden: false,
          isLogin: true,
          disabled: false,
          enabled: 1,
          createTime: new Date('2026-04-21T00:00:00.000Z'),
          updateTime: new Date('2026-04-21T00:00:00.000Z'),
          children: [
            {
              id: 'menu-child',
              parentId: 'menu-root',
              path: '/system/user',
              title: '用户管理',
              icon: 'user',
              order: 2,
              keepAlive: false,
              hidden: false,
              isLogin: true,
              disabled: false,
              enabled: 1,
              createTime: new Date('2026-04-21T00:00:01.000Z'),
              updateTime: new Date('2026-04-21T00:00:01.000Z'),
              children: [],
            },
          ],
        },
      ],
      permissions: ['user:list'],
    });
  });

  it('should still return role menus when menu disabled flag is true', async () => {
    const safeUser = {
      id: 'user-3',
      username: 'superadmin',
      isSuperAdmin: 0,
      roleId: 'role-2',
      nickname: '超级管理员',
      enabled: 1,
      remark: null,
      createTime: new Date('2026-04-21T00:00:00.000Z'),
      updateTime: new Date('2026-04-21T00:00:00.000Z'),
    };

    usersService.findOne.mockResolvedValue(safeUser);
    prismaService.role.findUnique.mockResolvedValue({
      menus: [
        {
          id: 'menu-disabled',
          parentId: null,
          path: '/dashboard',
          title: '仪表盘',
          icon: 'dashboard',
          order: 1,
          keepAlive: false,
          hidden: false,
          isLogin: true,
          disabled: true,
          enabled: 1,
          createTime: new Date('2026-04-21T00:00:00.000Z'),
          updateTime: new Date('2026-04-21T00:00:00.000Z'),
        },
      ],
      permissions: [],
    });

    await expect(service.getProfile('user-3')).resolves.toEqual({
      user: safeUser,
      menus: [
        {
          id: 'menu-disabled',
          parentId: null,
          path: '/dashboard',
          title: '仪表盘',
          icon: 'dashboard',
          order: 1,
          keepAlive: false,
          hidden: false,
          isLogin: true,
          disabled: true,
          enabled: 1,
          createTime: new Date('2026-04-21T00:00:00.000Z'),
          updateTime: new Date('2026-04-21T00:00:00.000Z'),
          children: [],
        },
      ],
      permissions: [],
    });
  });

  it('should remove session when logging out', async () => {
    authSessionService.removeSession.mockResolvedValue(undefined);

    await expect(service.logout('session-1')).resolves.toEqual({ loggedOut: true });
    expect(authSessionService.removeSession).toHaveBeenCalledWith('session-1');
  });
});
