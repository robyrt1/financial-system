"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DI_TOKENS = void 0;
exports.DI_TOKENS = {
    // todo: Driving Ports (In)
    VALIDATE_TOKEN_PORT: Symbol('VALIDATE_TOKEN_PORT'),
    ROUTE_REQUEST_PORT: Symbol('ROUTE_REQUEST_PORT'),
    // todo: Driven Ports (Out)
    TOKEN_VERIFIER_PORT: Symbol('TOKEN_VERIFIER_PORT'),
    HTTP_PROXY_PORT: Symbol('HTTP_PROXY_PORT'),
    CACHE_PORT: Symbol('CACHE_PORT'),
};
