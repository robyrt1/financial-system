import './otel';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@infrastructure/app.module';
import { GlobalExceptionFilter } from '@infrastructure/adapters/in/http/filters/domain-exception.filter';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  app.enableShutdownHooks();

  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);

  await app.listen(port);

  const erros = ['uncaughtException', 'unhandledRejection', 'SIGTERM', 'SIGINT']

  erros.forEach((erro) => {
    process.on(erro, async (error) => {
      console.log(erro, error);
      await app.close()
      process.exit(1);
    });
  })
}
bootstrap();
