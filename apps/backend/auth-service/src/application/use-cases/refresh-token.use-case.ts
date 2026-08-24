import {
  IRefreshTokenUseCase,
  RefreshTokenInputDto,
} from '@domain/ports/in/refresh-token.port';
import { AuthTokensResponseDto } from '@domain/ports/in/login-user.port';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import type { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';
import type { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import type { CacheRepositoryPort } from '@domain/ports/out/cache-repository.port';
import {
  InvalidTokenError,
  SessionExpiredError,
  InvalidCredentialsError,
} from '@domain/errors/auth-errors';

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenVerifier: TokenVerifierPort,
    private readonly cacheRepository: CacheRepositoryPort,
  ) {}

  async execute(dto: RefreshTokenInputDto): Promise<AuthTokensResponseDto> {
    let payload;
    try {
      payload = this.tokenVerifier.verify(dto.refreshToken);
    } catch {
      throw new InvalidTokenError('Refresh token inválido ou expirado');
    }

    const userId = payload.userId;
    const tokenFamily = payload.tokenFamily;

    if (!tokenFamily) {
      throw new InvalidTokenError('Estrutura do token inválida');
    }

    const sessionKey = `session:${userId}:${tokenFamily}`;
    const activeToken = await this.cacheRepository.get(sessionKey);

    // Detect reuse/theft: if Redis doesn't have it, or it doesn't match the one stored
    if (!activeToken || activeToken !== dto.refreshToken) {
      // Revoke the entire family
      await this.cacheRepository.del(sessionKey);
      throw new SessionExpiredError();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Generate rotated pair
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roles: ['admin'],
      tokenFamily,
    };
    const newAccessToken =
      this.tokenGenerator.generateAccessToken(tokenPayload);
    const newRefreshToken =
      this.tokenGenerator.generateRefreshToken(tokenPayload);

    // Update active refresh token in Redis
    await this.cacheRepository.set(sessionKey, newRefreshToken, 604800);

    return {
      requiresMfa: false,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
