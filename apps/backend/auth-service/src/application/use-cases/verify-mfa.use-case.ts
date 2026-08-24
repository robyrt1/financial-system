import {
  IVerifyMfaUseCase,
  VerifyMfaInputDto,
} from '@domain/ports/in/verify-mfa.port';
import { AuthTokensResponseDto } from '@domain/ports/in/login-user.port';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import type { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';
import type { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import type { CacheRepositoryPort } from '@domain/ports/out/cache-repository.port';
import {
  MfaCodeInvalidError,
  InvalidTokenError,
  InvalidCredentialsError,
} from '@domain/errors/auth-errors';
import { Totp } from '@infrastructure/adapters/out/security/totp';
import * as crypto from 'crypto';

export class VerifyMfaUseCase implements IVerifyMfaUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenVerifier: TokenVerifierPort,
    private readonly cacheRepository: CacheRepositoryPort,
  ) {}

  async execute(dto: VerifyMfaInputDto): Promise<AuthTokensResponseDto> {
    let payload;
    try {
      payload = this.tokenVerifier.verify(dto.mfaToken);
    } catch {
      throw new InvalidTokenError('MFA token inválido ou expirado');
    }

    if (payload.scope !== 'mfa_pending') {
      throw new InvalidTokenError('Escopo do token inválido');
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.mfaSecret) {
      throw new MfaCodeInvalidError();
    }

    const isValid = Totp.verify(user.mfaSecret, dto.code);
    if (!isValid) {
      throw new MfaCodeInvalidError();
    }

    const tokenFamily = crypto.randomUUID();
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roles: ['admin'],
      tokenFamily,
    };

    const accessToken = this.tokenGenerator.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenGenerator.generateRefreshToken(tokenPayload);

    // Store active refresh token in Redis for 7 days (604800 seconds)
    await this.cacheRepository.set(
      `session:${user.id}:${tokenFamily}`,
      refreshToken,
      604800,
    );

    return {
      requiresMfa: false,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
