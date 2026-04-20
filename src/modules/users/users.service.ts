import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // 查询全部用户，默认按主键升序返回，便于观察新增结果。
  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      orderBy: {
        createTime: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('创建用户:', createUserDto);
    return this.prismaService.user.create({
      data: {
        username: createUserDto.username,
        password: createUserDto.password,
        nickname: createUserDto.nickname,
        roleId: createUserDto.roleId,
        isSuperAdmin: createUserDto.isSuperAdmin ?? 0,
        enabled: createUserDto.enabled ?? 1,
        remark: createUserDto.remark,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        password: updateUserDto.password,
        nickname: updateUserDto.nickname,
        roleId: updateUserDto.roleId,
        isSuperAdmin: updateUserDto.isSuperAdmin,
        enabled: updateUserDto.enabled,
        remark: updateUserDto.remark,
      },
    });
  }

  async remove(id: string): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
