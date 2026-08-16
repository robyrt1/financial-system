import { Provider } from '@nestjs/common';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import { AuthenticateRequestUseCase } from '@application/use-cases/authenticate-request.use-case';
import { ForwardRequestUseCase } from '@application/use-cases/forward-request.use-case';
import { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import { HttpProxyPort } from '@domain/ports/out/http-proxy.port';
import { EnvironmentService } from '@financial-system/shared-services';

export const useCaseProviders: Provider[] = [
    {
        provide: DI_TOKENS.VALIDATE_TOKEN_PORT,
        useFactory: (tokenVerifier: TokenVerifierPort) =>
            new AuthenticateRequestUseCase(tokenVerifier),
        inject: [DI_TOKENS.TOKEN_VERIFIER_PORT],
    },
    {
        provide: DI_TOKENS.ROUTE_REQUEST_PORT,
        useFactory: (proxyAdapter: HttpProxyPort) =>
            new ForwardRequestUseCase(proxyAdapter, new EnvironmentService()),
        inject: [DI_TOKENS.HTTP_PROXY_PORT],
    },
];