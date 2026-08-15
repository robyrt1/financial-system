"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterProviders = void 0;
const tokens_1 = require("./tokens");
const jwt_verifier_adapter_1 = require("../adapters/out/jwt/jwt-verifier.adapter");
const axios_proxy_adapter_1 = require("../adapters/out/proxy/axios-proxy.adapter");
const redis_cache_adapter_1 = require("../adapters/out/redis/redis-cache.adapter");
exports.adapterProviders = [
    {
        provide: tokens_1.DI_TOKENS.TOKEN_VERIFIER_PORT,
        useClass: jwt_verifier_adapter_1.JwtVerifierAdapter,
    },
    {
        provide: tokens_1.DI_TOKENS.HTTP_PROXY_PORT,
        useClass: axios_proxy_adapter_1.AxiosProxyAdapter,
    },
    {
        provide: tokens_1.DI_TOKENS.CACHE_PORT,
        useClass: redis_cache_adapter_1.RedisCacheAdapter,
    },
];
