import { Injectable } from '@nestjs/common';
import { Menu } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Menu[]> {
    return this.prismaService.menu.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string): Promise<Menu | null> {
    return this.prismaService.menu.findUnique({
      where: { id },
      include: { children: true, permissions: true },
    });
  }

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    return this.prismaService.menu.create({
      data: {
        title: createMenuDto.title,
        path: createMenuDto.path,
        icon: createMenuDto.icon,
        order: createMenuDto.order,
        keepAlive: createMenuDto.keepAlive,
        hidden: createMenuDto.hidden,
        isLogin: createMenuDto.isLogin,
        disabled: createMenuDto.disabled,
        parentId: createMenuDto.parentId,
      },
    });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    return this.prismaService.menu.update({
      where: { id },
      data: {
        title: updateMenuDto.title,
        path: updateMenuDto.path,
        icon: updateMenuDto.icon,
        order: updateMenuDto.order,
        keepAlive: updateMenuDto.keepAlive,
        hidden: updateMenuDto.hidden,
        isLogin: updateMenuDto.isLogin,
        disabled: updateMenuDto.disabled,
        parentId: updateMenuDto.parentId,
      },
    });
  }

  async remove(id: string): Promise<Menu> {
    return this.prismaService.menu.delete({
      where: { id },
    });
  }
}
