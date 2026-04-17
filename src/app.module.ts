import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { getEnvFilePaths } from './config/env.util';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from './common/logger/winston.logger';

@Module({
  imports: [
    // 根据 NODE_ENV 自动加载开发环境或生产环境配置，并做基础校验。
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: getEnvFilePaths(),
      load: [configuration],
      validate: validateEnv,
    }),
    /* 构建日志 */
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createWinstonLogger(configService),
    }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
