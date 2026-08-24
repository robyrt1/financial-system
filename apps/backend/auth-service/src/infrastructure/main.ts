import './otel';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@infrastructure/adapters/in/http/filters/domain-exception.filter';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
  });

  setupSwagger(app);

  await app.listen(port);
  console.info(`Auth Service ativo na porta: ${port}`);

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
