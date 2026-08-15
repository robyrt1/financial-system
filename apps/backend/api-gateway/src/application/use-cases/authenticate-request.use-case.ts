import { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import { UserSession } from '@domain/entities/user-session.entity';
import {
  MissingTokenError,
  TokenExpiredOrInvalidError,
} from '@domain/errors/gateway-errors';

export class AuthenticateRequestUseCase {
  constructor(private readonly tokenVerifier: TokenVerifierPort) {}

  async execute(authHeader?: string): Promise<UserSession> {
    if (!authHeader) {
      throw new MissingTokenError();
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new TokenExpiredOrInvalidError();
    }

    return this.tokenVerifier.verify(token);
  }
}

export const AUTHENTICATE_REQUEST_USE_CASE = Symbol(
  'AuthenticateRequestUseCase',
);
