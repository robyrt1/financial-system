import { EnvironmentService } from '@financial-system/shared-services'

const environmentService = new EnvironmentService();

export interface EnvironmentVariables {
    PORT: number;
    JWT_SECRET: string;
    INTERNAL_SERVICE_KEY: string;
    RABBITMQ_URL: string;
}

export const envConfiguration = (): EnvironmentVariables => ({
    PORT: parseInt(environmentService.getOrThrow<string>('PORT'), 10),
    JWT_SECRET: environmentService.getOrThrow<string>('JWT_SECRET'),
    INTERNAL_SERVICE_KEY:
        environmentService.getOrThrow<string>('INTERNAL_SERVICE_KEY'),
    RABBITMQ_URL: environmentService.getOrThrow<string>('RABBITMQ_URL'),
});
