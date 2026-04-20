import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 查询全部用户。
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 根据主键 ID 查询单个用户。
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 创建用户，演示 Prisma create 的基本用法。
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('wo diu');
    return this.usersService.create(createUserDto);
  }

  // 更新指定用户，演示 Prisma update 的基本用法。
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 删除指定用户，演示 Prisma delete 的基本用法。
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
