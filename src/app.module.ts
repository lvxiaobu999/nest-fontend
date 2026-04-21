import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpLoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { createWinstonLogger } from './common/logger/winston.logger';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import configuration from './config/configuration';
import { getEnvFilePaths } from './config/env.util';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MenusModule } from './modules/menus/menus.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
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
    DashboardModule,
    UsersModule,
    MenusModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requestIdMiddleware).forRoutes('*');
  }
}
