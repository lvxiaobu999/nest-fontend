import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启用 CORS，允许前端应用访问后端 API。
  app.enableCors();

  const configService = app.get(ConfigService);
  const bootstrapLogger = new Logger('Bootstrap');
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动过滤掉没有装饰器的属性
      forbidNonWhitelisted: true, // 禁止非白名单属性，返回错误
      transform: true, // 自动转换类型（如字符串转数字）
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式转换
      },
    }),
  );

  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);

  bootstrapLogger.log(`Application is running at ${await app.getUrl()}`);
  bootstrapLogger.log(`Current environment: ${configService.get<string>('app.nodeEnv')}`);

  process.on('unhandledRejection', (reason) => {
    bootstrapLogger.error(`Unhandled Rejection: ${String(reason)}`);
  });

  process.on('uncaughtException', (error) => {
    bootstrapLogger.error(`Uncaught Exception: ${error.message}`, error.stack);
  });
}

void bootstrap();
