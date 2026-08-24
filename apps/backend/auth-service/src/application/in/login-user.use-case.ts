import {
  LoginUserInputDto,
  AuthTokensResponseDto,
} from '@application/dtos/auth.dto';
import { InvalidCredentialsError } from '@domain/errors/auth-errors';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import type { PasswordHasherPort } from '@domain/ports/out/password-hasher.port';
import type { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';
import type { CacheRepositoryPort } from '@domain/ports/out/cache-repository.port';
import { ILoginUserUseCase } from '@domain/ports/in/login-user.port';
import * as crypto from 'crypto';

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly cacheRepository: CacheRepositoryPort,
  ) {}

  async execute(dto: LoginUserInputDto): Promise<AuthTokensResponseDto> {
    const user = await this.userRepository.findByEmail(
      dto.email.toLowerCase().trim(),
    );
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isMatch = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    if (user.mfaEnabled) {
      const mfaToken = this.tokenGenerator.generateMfaToken({
        userId: user.id,
        email: user.email,
      });

      return {
        requiresMfa: true,
        mfaToken,
      };
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
