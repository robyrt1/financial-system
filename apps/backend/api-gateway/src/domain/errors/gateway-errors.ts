import { BaseDomainError } from '@financial-system/shared-errors';

export class TokenExpiredOrInvalidError extends BaseDomainError {
  readonly code = 'GATEWAY.TOKEN_EXPIRED_OR_INVALID';
  readonly translationKey = 'errors.gateway.token_expired_or_invalid';
  readonly statusCode = 401;

  constructor() {
    super('O token de autenticação está expirado ou é inválido');
  }
}

export class MissingTokenError extends BaseDomainError {
  readonly code = 'GATEWAY.MISSING_TOKEN';
  readonly translationKey = 'errors.gateway.missing_token';
  readonly statusCode = 401;

  constructor() {
    super('Header de autorização não fornecido');
  }
}

export class ServiceUnavailableError extends BaseDomainError {
  readonly code = 'GATEWAY.SERVICE_UNAVAILABLE';
  readonly translationKey = 'errors.gateway.service_unavailable';
  readonly statusCode = 503;

  constructor(serviceName: string) {
    super(`O serviço ${serviceName} está temporariamente indisponível`, {
      params: { service: serviceName },
      details: { service: serviceName },
    });
  }
}
