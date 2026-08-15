"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfiguration = void 0;
const shared_services_1 = require("@financial-system/shared-services");
const environmentService = new shared_services_1.EnvironmentService();
const envConfiguration = () => ({
    PORT: parseInt(environmentService.getOrThrow('PORT'), 10),
    FRONTEND_URL: environmentService.getOrThrow('FRONTEND_URL'),
    JWT_SECRET: environmentService.getOrThrow('JWT_SECRET'),
    INTERNAL_SERVICE_KEY: environmentService.getOrThrow('INTERNAL_SERVICE_KEY'),
    AUTH_SERVICE_URL: environmentService.getOrThrow('AUTH_SERVICE_URL'),
    CORE_BANKING_SERVICE_URL: environmentService.getOrThrow('CORE_BANKING_SERVICE_URL'),
    ANALYTICS_SERVICE_URL: environmentService.getOrThrow('ANALYTICS_SERVICE_URL'),
});
exports.envConfiguration = envConfiguration;
