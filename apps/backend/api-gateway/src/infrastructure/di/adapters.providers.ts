import { Provider } from '@nestjs/common';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import { JwtVerifierAdapter } from '@infrastructure/adapters/out/jwt/jwt-verifier.adapter';
import { AxiosProxyAdapter } from '@infrastructure/adapters/out/proxy/axios-proxy.adapter';
import { RedisCacheAdapter } from '@infrastructure/adapters/out/redis/redis-cache.adapter';

export const adapterProviders: Provider[] = [
    {
        provide: DI_TOKENS.TOKEN_VERIFIER_PORT,
        useClass: JwtVerifierAdapter,
    },
    {
        provide: DI_TOKENS.HTTP_PROXY_PORT,
        useClass: AxiosProxyAdapter,
    },
    {
        provide: DI_TOKENS.CACHE_PORT,
        useClass: RedisCacheAdapter,
    },
];