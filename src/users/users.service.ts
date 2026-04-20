import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // 查询全部用户，默认按主键升序返回，便于观察新增结果。
  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('创建用户:', createUserDto);
    return this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.username ?? null,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: {
        email: updateUserDto.email,
        name: updateUserDto.username,
      },
    });
  }

  async remove(id: number): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
