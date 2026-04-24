import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userPublicSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  isSuperAdmin: true,
  roleId: true,
  nickname: true,
  enabled: true,
  remark: true,
  createTime: true,
  updateTime: true,
});

const userListSelect = Prisma.validator<Prisma.UserSelect>()({
  ...userPublicSelect,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
});

export type SafeUser = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;
export type UserListItem = Prisma.UserGetPayload<{ select: typeof userListSelect }>;

export interface PaginatedUsersResponse {
  list: UserListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: QueryUsersDto): Promise<PaginatedUsersResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const [total, list] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.user.findMany({
        skip,
        take: pageSize,
        select: userListSelect,
        orderBy: {
          createTime: 'desc',
        },
      }),
    ]);

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string): Promise<SafeUser | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  async validateLogin(username: string, password: string): Promise<SafeUser | null> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user || user.enabled !== true) {
      return null;
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.toSafeUser(user);
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.prismaService.user.create({
      select: userPublicSelect,
      data: {
        username: createUserDto.username,
        password: await hashPassword(createUserDto.password),
        nickname: createUserDto.nickname,
        roleId: createUserDto.roleId,
        isSuperAdmin: createUserDto.isSuperAdmin ?? false,
        enabled: createUserDto.enabled ?? true,
        remark: createUserDto.remark,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const data: Prisma.UserUncheckedUpdateInput = {
      username: updateUserDto.username,
      nickname: updateUserDto.nickname,
      roleId: updateUserDto.roleId,
      isSuperAdmin: updateUserDto.isSuperAdmin,
      enabled: updateUserDto.enabled,
      remark: updateUserDto.remark,
    };

    if (updateUserDto.password !== undefined) {
      data.password = await hashPassword(updateUserDto.password);
    }

    return this.prismaService.user.update({
      where: { id },
      select: userPublicSelect,
      data,
    });
  }

  async remove(id: string): Promise<SafeUser> {
    return this.prismaService.user.delete({
      where: { id },
      select: userPublicSelect,
    });
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      username: user.username,
      isSuperAdmin: user.isSuperAdmin,
      roleId: user.roleId,
      nickname: user.nickname,
      enabled: user.enabled,
      remark: user.remark,
      createTime: user.createTime,
      updateTime: user.updateTime,
    };
  }
}
