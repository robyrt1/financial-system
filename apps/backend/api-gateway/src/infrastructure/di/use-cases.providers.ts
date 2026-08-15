import { Provider } from '@nestjs/common';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import { AuthenticateRequestUseCase } from '@application/use-cases/authenticate-request.use-case';
import { ForwardRequestUseCase } from '@application/use-cases/forward-request.use-case';

export const useCaseProviders: Provider[] = [
    {
        provide: DI_TOKENS.VALIDATE_TOKEN_PORT,
        useClass: AuthenticateRequestUseCase,
    },
    {
        provide: DI_TOKENS.ROUTE_REQUEST_PORT,
        useClass: ForwardRequestUseCase,
    },
];