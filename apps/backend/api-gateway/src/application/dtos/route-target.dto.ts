export interface ForwardRequestDto {
  service: 'auth' | 'core-banking' | 'analytics';
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, unknown>;
  userId?: string;
}
