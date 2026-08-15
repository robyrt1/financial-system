"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.MissingTokenError = exports.TokenExpiredOrInvalidError = void 0;
// apps/backend/api-gateway/src/domain/errors/gateway-errors.ts
const shared_errors_1 = require("@financial-system/shared-errors");
class TokenExpiredOrInvalidError extends shared_errors_1.BaseDomainError {
    code = 'GATEWAY.TOKEN_EXPIRED_OR_INVALID';
    translationKey = 'errors.gateway.token_expired_or_invalid';
    statusCode = 401;
    constructor() {
        super('O token de autenticação está expirado ou é inválido');
    }
}
exports.TokenExpiredOrInvalidError = TokenExpiredOrInvalidError;
class MissingTokenError extends shared_errors_1.BaseDomainError {
    code = 'GATEWAY.MISSING_TOKEN';
    translationKey = 'errors.gateway.missing_token';
    statusCode = 401;
    constructor() {
        super('Header de autorização não fornecido');
    }
}
exports.MissingTokenError = MissingTokenError;
class ServiceUnavailableError extends shared_errors_1.BaseDomainError {
    code = 'GATEWAY.SERVICE_UNAVAILABLE';
    translationKey = 'errors.gateway.service_unavailable';
    statusCode = 503;
    constructor(serviceName) {
        super(`O serviço ${serviceName} está temporariamente indisponível`, {
            params: { service: serviceName },
            details: { service: serviceName },
        });
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
