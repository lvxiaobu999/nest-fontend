import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const bootstrapLogger = new Logger('Bootstrap');
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

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
