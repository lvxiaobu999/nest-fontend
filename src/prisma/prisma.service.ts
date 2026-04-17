import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.get<string>('database.url');

    if (!connectionString) {
      throw new Error('未找到 DATABASE_URL，请检查当前环境文件配置。');
    }

    // Prisma 7 通过 PostgreSQL 驱动适配器连接不同环境下的数据库。
    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  // 应用关闭时主动释放 Prisma 连接，避免数据库连接残留。
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
