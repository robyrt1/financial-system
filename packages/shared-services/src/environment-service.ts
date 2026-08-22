import { env } from "node:process";

export class EnvironmentService {
  get<T>(key: string): T | undefined {
    const value = env[key];
    return value ? (value as T) : undefined;
  }
  getOrThrow<T>(key: string, key_default?: string): T {
    const value = this.get<T>(key);
    if (!value) {
      if (!key_default) {
        throw new Error(`Environment variable ${key} is not defined`);
      }
      return key_default as T;
    }
    return value;
  }
}
