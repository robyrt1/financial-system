"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForwardRequestUseCase = void 0;
const gateway_errors_1 = require("../../domain/errors/gateway-errors");
class ForwardRequestUseCase {
    proxyAdapter;
    environment;
    constructor(proxyAdapter, environment) {
        this.proxyAdapter = proxyAdapter;
        this.environment = environment;
    }
    async execute(dto) {
        const serviceUrls = {
            auth: this.environment.get('AUTH_SERVICE_URL'),
            'core-banking': this.environment.get('CORE_BANKING_SERVICE_URL'),
            analytics: this.environment.get('ANALYTICS_SERVICE_URL'),
        };
        const baseUrl = serviceUrls[dto.service];
        if (!baseUrl) {
            throw new gateway_errors_1.ServiceUnavailableError(dto.service);
        }
        const targetUrl = `${baseUrl}/${dto.path}`;
        const internalSecret = this.environment.getOrThrow('INTERNAL_SERVICE_KEY', 'ENV_VAR_NOT_DEFINED_ERROR');
        const outboundHeaders = {
            ...dto.headers,
            'x-internal-secret': internalSecret,
            ...(dto.userId ? { 'x-user-id': dto.userId } : {}),
        };
        delete outboundHeaders['host'];
        delete outboundHeaders['authorization'];
        return this.proxyAdapter.forward({
            targetUrl,
            method: dto.method,
            headers: outboundHeaders,
            body: dto.body,
            params: dto.query,
        });
    }
}
exports.ForwardRequestUseCase = ForwardRequestUseCase;
