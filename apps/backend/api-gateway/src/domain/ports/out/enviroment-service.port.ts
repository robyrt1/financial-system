export interface EnvironmentServicePort {
  get<T>(key: string): T | undefined;
  getOrThrow<T>(key: string, key_default?: string): T;
}
