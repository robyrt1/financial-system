export interface ProxyRequestInput {
  targetUrl: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  params?: Record<string, unknown>;
}

export interface HttpProxyPort {
  forward<T = unknown>(
    input: ProxyRequestInput,
  ): Promise<{ data: T; status: number; headers: Record<string, unknown> }>;
}
