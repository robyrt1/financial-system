import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import {
    type ValidateTokenPort,
} from '@domain/ports/in/validate-token.port';
import { AuthenticatedUserDto } from '@application/dtos/authenticated-user.dto';
import { DI_TOKENS } from '@infrastructure/di/tokens';

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUserDto;
}

@Injectable()
export class GatewayAuthGuard implements CanActivate {
    constructor(
        @Inject(DI_TOKENS.VALIDATE_TOKEN_PORT)
        private readonly validateTokenPort: ValidateTokenPort,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = req.headers['authorization'];

        const session = await this.validateTokenPort.execute(authHeader);
        req.user = {
            userId: session.userId,
            email: session.email,
            roles: session.roles,
        };

        return true;
    }
}
