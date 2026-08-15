"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const domain_exception_filter_1 = require("./adapters/in/http/filters/domain-exception.filter");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:5173');
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
    });
    app.enableShutdownHooks();
    app.useGlobalFilters(new domain_exception_filter_1.GlobalExceptionFilter());
    await app.listen(port);
}
bootstrap();
