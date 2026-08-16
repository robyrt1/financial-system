import { Provider } from '@nestjs/common';
import { AUTH_DI_TOKENS } from './tokens';
import { InMemoryUserRepository } from '@infrastructure/adapters/out/persistence/in-memory-user.repository';
import { BcryptHasherAdapter } from '@infrastructure/adapters/out/cryptography/bcrypt-hasher.adapter';
import { JwtGeneratorAdapter } from '@infrastructure/adapters/out/jwt/jwt-generator.adapter';
import { RabbitMqPublisherAdapter } from '@infrastructure/adapters/out/messaging/rabbitmq-publisher.adapter';
import { RegisterUserUseCase } from '@application/dtos/in/register-user.use-case';
import { LoginUserUseCase } from '@application/dtos/in/login-user.use-case';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { PasswordHasherPort } from '@domain/ports/out/password-hasher.port';
import { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';

export const authProviders: Provider[] = [
    {
        provide: AUTH_DI_TOKENS.REGISTER_USER_PORT,
        useFactory: (
            userRepository: UserRepositoryPort,
            passwordHasher: PasswordHasherPort,
            tokenGenerator: TokenGeneratorPort,
            eventPublisher: EventPublisherPort,
        ) => new RegisterUserUseCase(userRepository, passwordHasher, tokenGenerator, eventPublisher),
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
        ) => new LoginUserUseCase(userRepository, passwordHasher, tokenGenerator),
        inject: [
            AUTH_DI_TOKENS.USER_REPOSITORY_PORT,
            AUTH_DI_TOKENS.PASSWORD_HASHER_PORT,
            AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
        ],
    },
    { provide: AUTH_DI_TOKENS.USER_REPOSITORY_PORT, useFactory: () => new InMemoryUserRepository() },
    { provide: AUTH_DI_TOKENS.PASSWORD_HASHER_PORT, useFactory: () => new BcryptHasherAdapter() },
    {
        provide: AUTH_DI_TOKENS.TOKEN_GENERATOR_PORT,
        useFactory: (configService: ConfigService) => new JwtGeneratorAdapter(configService),
        inject: [ConfigService],
    },
    {
        provide: AUTH_DI_TOKENS.EVENT_PUBLISHER_PORT,
        useFactory: (configService: ConfigService) => new RabbitMqPublisherAdapter(configService),
        inject: [ConfigService],
    },
];