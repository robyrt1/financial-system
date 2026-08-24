export type TargetMicroservice = 'auth' | 'core-banking' | 'analytics';

export interface RouteRequestParams {
  service: TargetMicroservice;
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, unknown>;
  userId?: string;
  userRole?: string;
}

export interface RouteResponseResult<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, unknown>;
}
