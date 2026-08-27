import { EnvironmentService } from '@financial-system/shared-services';

const environmentService = new EnvironmentService();

export interface EnvironmentVariables {
  PORT: number;
  FRONTEND_URL: string;
  JWT_SECRET: string;
  INTERNAL_SERVICE_KEY: string;
  AUTH_SERVICE_URL: string;
  CORE_BANKING_SERVICE_URL: string;
  ANALYTICS_SERVICE_URL: string;
  FINANCIAL_SERVICE_URL: string;
}

export const envConfiguration = (): EnvironmentVariables => ({
  PORT: parseInt(environmentService.getOrThrow<string>('PORT'), 10),
  FRONTEND_URL: environmentService.getOrThrow<string>('FRONTEND_URL'),
  JWT_SECRET: environmentService.getOrThrow<string>('JWT_SECRET'),
  INTERNAL_SERVICE_KEY: environmentService.getOrThrow<string>(
    'INTERNAL_SERVICE_KEY',
  ),
  AUTH_SERVICE_URL: environmentService.getOrThrow<string>('AUTH_SERVICE_URL'),
  CORE_BANKING_SERVICE_URL: environmentService.getOrThrow<string>(
    'CORE_BANKING_SERVICE_URL',
  ),
  ANALYTICS_SERVICE_URL: environmentService.getOrThrow<string>(
    'ANALYTICS_SERVICE_URL',
  ),
  FINANCIAL_SERVICE_URL: environmentService.getOrThrow<string>(
    'FINANCIAL_SERVICE_URL',
  ),
});
