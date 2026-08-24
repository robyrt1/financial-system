import { Provider } from '@nestjs/common';
import { AUTH_DI_TOKENS } from './tokens';
import { InMemoryUserRepository } from '@infrastructure/adapters/out/persistence/in-memory-user.repository';
import { BcryptHasherAdapter } from '@infrastructure/adapters/out/cryptography/bcrypt-hasher.adapter';
import { JwtGeneratorAdapter } from '@infrastructure/adapters/out/jwt/jwt-generator.adapter';
import { JwtVerifierAdapter } from '@infrastructure/adapters/out/jwt/jwt-verifier.adapter';
import { RedisCacheAdapter } from '@infrastructure/adapters/out/redis/redis-cache.adapter';
import { RabbitMqPublisherAdapter } from '@infrastructure/adapters/out/messaging/rabbitmq-publisher.adapter';
import { RegisterUserUseCase } from '@application/in/register-user.use-case';
import { LoginUserUseCase } from '@application/in/login-user.use-case';
import { VerifyMfaUseCase } from '@application/use-cases/verify-mfa.use-case';
import { SetupMfaUseCase } from '@application/use-cases/setup-mfa.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { GetMfaStatusUseCase } from '@application/use-cases/get-mfa-status.use-case';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { PasswordHasherPort } from '@domain/ports/out/password-hasher.port';
import { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';
import { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { CacheRepositoryPort } from '@domain/ports/out/cache-repository.port';

// Sharing the user repository singleton
const userRepoInstance = new InMemoryUserRepository();

export const authProviders: Provider[] = [
  {
    provide: AUTH_DI_TOKENS.REGISTER_USER_PORT,
    useFactory: (
      userRepository: UserRepositoryPort,
      passwordHasher: PasswordHasherPort,
      tokenGenerator: TokenGeneratorPort,
      eventPublisher: EventPublisherPort,
    ) =>
      new RegisterUserUseCase(
        userRepository,
        passwordHasher,
        tokenGenerator,
        eventPublisher,
      ),
    inject: [
      AUTH_DI_TOKENS.USER_REPOSITORY_PORT,
      AUTH_DI_TOKENS.PASSWORD_HASHER_PORT,
      AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
      AUTH_DI_TOKENS.EVENT_PUBLISHER_PORT,
    ],
  },
  {
    provide: AUTH_DI_TOKENS.LOGIN_USER_PORT,
    useFactory: (
      userRepository: UserRepositoryPort,
      passwordHasher: PasswordHasherPort,
      tokenGenerator: TokenGeneratorPort,
      cacheRepository: CacheRepositoryPort,
    ) =>
      new LoginUserUseCase(
        userRepository,
        passwordHasher,
        tokenGenerator,
        cacheRepository,
      ),
    inject: [
      AUTH_DI_TOKENS.USER_REPOSITORY_PORT,
      AUTH_DI_TOKENS.PASSWORD_HASHER_PORT,
      AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
      AUTH_DI_TOKENS.CACHE_REPOSITORY_PORT,
    ],
  },
  {
    provide: AUTH_DI_TOKENS.VERIFY_MFA_PORT,
    useFactory: (
      userRepository: UserRepositoryPort,
      tokenGenerator: TokenGeneratorPort,
      tokenVerifier: TokenVerifierPort,
      cacheRepository: CacheRepositoryPort,
    ) =>
      new VerifyMfaUseCase(
        userRepository,
        tokenGenerator,
        tokenVerifier,
        cacheRepository,
      ),
    inject: [
      AUTH_DI_TOKENS.USER_REPOSITORY_PORT,
      AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
      AUTH_DI_TOKENS.TOKEN_VERIFIER_PORT,
      AUTH_DI_TOKENS.CACHE_REPOSITORY_PORT,
    ],
  },
  {
    provide: AUTH_DI_TOKENS.SETUP_MFA_PORT,
    useFactory: (userRepository: UserRepositoryPort) =>
      new SetupMfaUseCase(userRepository),
    inject: [AUTH_DI_TOKENS.USER_REPOSITORY_PORT],
  },
  {
    provide: AUTH_DI_TOKENS.REFRESH_TOKEN_PORT,
    useFactory: (
      userRepository: UserRepositoryPort,
      tokenGenerator: TokenGeneratorPort,
      tokenVerifier: TokenVerifierPort,
      cacheRepository: CacheRepositoryPort,
    ) =>
      new RefreshTokenUseCase(
        userRepository,
        tokenGenerator,
        tokenVerifier,
        cacheRepository,
      ),
    inject: [
      AUTH_DI_TOKENS.USER_REPOSITORY_PORT,
      AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
      AUTH_DI_TOKENS.TOKEN_VERIFIER_PORT,
      AUTH_DI_TOKENS.CACHE_REPOSITORY_PORT,
    ],
  },
  {
    provide: AUTH_DI_TOKENS.LOGOUT_PORT,
    useFactory: (cacheRepository: CacheRepositoryPort) =>
      new LogoutUseCase(cacheRepository),
    inject: [AUTH_DI_TOKENS.CACHE_REPOSITORY_PORT],
  },
  {
    provide: AUTH_DI_TOKENS.GET_MFA_STATUS_PORT,
    useFactory: (userRepository: UserRepositoryPort) =>
      new GetMfaStatusUseCase(userRepository),
    inject: [AUTH_DI_TOKENS.USER_REPOSITORY_PORT],
  },
  { provide: AUTH_DI_TOKENS.USER_REPOSITORY_PORT, useValue: userRepoInstance },
  {
    provide: AUTH_DI_TOKENS.PASSWORD_HASHER_PORT,
    useFactory: () => new BcryptHasherAdapter(),
  },
  {
    provide: AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
    useFactory: (configService: ConfigService) =>
      new JwtGeneratorAdapter(configService),
    inject: [ConfigService],
  },
  {
    provide: AUTH_DI_TOKENS.TOKEN_VERIFIER_PORT,
    useFactory: (configService: ConfigService) =>
      new JwtVerifierAdapter(configService),
    inject: [ConfigService],
  },
  {
    provide: AUTH_DI_TOKENS.CACHE_REPOSITORY_PORT,
    useClass: RedisCacheAdapter,
  },
  {
    provide: AUTH_DI_TOKENS.EVENT_PUBLISHER_PORT,
    useFactory: (configService: ConfigService) =>
      new RabbitMqPublisherAdapter(configService),
    inject: [ConfigService],
  },
];
