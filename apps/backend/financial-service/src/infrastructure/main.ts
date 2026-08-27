import "./otel";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { GlobalExceptionFilter } from "@infrastructure/adapters/in/http/filters/domain-exception.filter";
import { setupSwagger } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3002);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: "*",
  });

  setupSwagger(app);

  await app.listen(port);
  console.info(`Financial Service ativo na porta: ${port}`);

  const errors = [
    "uncaughtException",
    "unhandledRejection",
    "SIGTERM",
    "SIGINT",
  ];

  errors.forEach((err) => {
    process.on(err, async (error) => {
      console.error(err, error);
      await app.close();
      process.exit(1);
    });
  });
}
bootstrap();
