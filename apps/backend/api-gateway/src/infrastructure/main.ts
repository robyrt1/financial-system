import './adapters/out/monitoring/otel';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@infrastructure/app.module';
import { GlobalExceptionFilter } from '@infrastructure/adapters/in/http/filters/domain-exception.filter';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
  });

  app.enableShutdownHooks();

  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);

  await app.listen(port);

  const erros = [
    'uncaughtException',
    'unhandledRejection',
    'SIGTERM',
    'SIGINT',
  ];

  erros.forEach((erro) => {
    process.on(erro, async (error) => {
      console.error(erro, error);
      await app.close();
      process.exit(1);
    });
  });
}
bootstrap();
