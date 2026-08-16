import { RouteRequestPort } from '@domain/ports/in/route-request.port';
import { HttpProxyPort } from '@domain/ports/out/http-proxy.port';
import { ServiceUnavailableError } from '@domain/errors/gateway-errors';
import { EnvironmentServicePort } from '@domain/ports/out/enviroment-service.port';
import {
  ForwardRequestDto,
  ProxyResponseDto,
} from '@application/dtos/proxy-request.dto';

export class ForwardRequestUseCase implements RouteRequestPort {
  constructor(
    private readonly proxyAdapter: HttpProxyPort,
    private readonly environment: EnvironmentServicePort,
  ) {}

  async execute(dto: ForwardRequestDto): Promise<ProxyResponseDto> {
    const serviceUrls: Record<string, string | undefined> = {
      auth: this.environment.get<string>('AUTH_SERVICE_URL'),
      'core-banking': this.environment.get<string>('CORE_BANKING_SERVICE_URL'),
      analytics: this.environment.get<string>('ANALYTICS_SERVICE_URL'),
    };

    const baseUrl = serviceUrls[dto.service];
    if (!baseUrl) {
      throw new ServiceUnavailableError(dto.service);
    }

    const targetUrl = `${baseUrl}/${dto.path}`;
    const internalSecret = this.environment.getOrThrow<string>(
      'INTERNAL_SERVICE_KEY',
      'ENV_VAR_NOT_DEFINED_ERROR',
    );

    const outboundHeaders: Record<string, string | undefined> = {
      ...(dto.headers as Record<string, string | undefined>),
      'x-internal-secret': internalSecret,
      ...(dto.userId ? { 'x-user-id': dto.userId } : {}),
    };

    delete outboundHeaders['host'];
    delete outboundHeaders['authorization'];
    delete outboundHeaders['content-length'];

    return this.proxyAdapter.forward({
      targetUrl,
      method: dto.method,
      headers: outboundHeaders,
      body: dto.body,
      params: dto.query,
    });
  }
}
