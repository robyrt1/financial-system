"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE_REQUEST_USE_CASE = exports.AuthenticateRequestUseCase = void 0;
const gateway_errors_1 = require("../../domain/errors/gateway-errors");
class AuthenticateRequestUseCase {
    tokenVerifier;
    constructor(tokenVerifier) {
        this.tokenVerifier = tokenVerifier;
    }
    async execute(authHeader) {
        if (!authHeader) {
            throw new gateway_errors_1.MissingTokenError();
        }
        const [scheme, token] = authHeader.split(' ');
        if (scheme !== 'Bearer' || !token) {
            throw new gateway_errors_1.TokenExpiredOrInvalidError();
        }
        return this.tokenVerifier.verify(token);
    }
}
exports.AuthenticateRequestUseCase = AuthenticateRequestUseCase;
exports.AUTHENTICATE_REQUEST_USE_CASE = Symbol('AuthenticateRequestUseCase');
