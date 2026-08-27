import { EnvironmentService } from "@financial-system/shared-services";

const environmentService = new EnvironmentService();

export interface EnvironmentVariables {
  PORT: number;
  INTERNAL_SERVICE_KEY: string;
  RABBITMQ_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  ENCRYPTION_KEY: string;
}

export const envConfiguration = (): EnvironmentVariables => ({
  PORT: parseInt(environmentService.getOrThrow<string>("PORT"), 10),
  INTERNAL_SERVICE_KEY: environmentService.getOrThrow<string>(
    "INTERNAL_SERVICE_KEY",
  ),
  RABBITMQ_URL: environmentService.getOrThrow<string>("RABBITMQ_URL"),
  DB_HOST: environmentService.getOrThrow<string>("DB_HOST"),
  DB_PORT: parseInt(environmentService.getOrThrow<string>("DB_PORT"), 10),
  DB_USERNAME: environmentService.getOrThrow<string>("DB_USERNAME"),
  DB_PASSWORD: environmentService.getOrThrow<string>("DB_PASSWORD"),
  DB_DATABASE: environmentService.getOrThrow<string>("DB_DATABASE"),
  ENCRYPTION_KEY: environmentService.getOrThrow<string>("ENCRYPTION_KEY"),
});
