import { randomUUID } from 'node:crypto';
import { User } from '@domain/entities/user.entity';
import { UserRegisteredEvent } from '@domain/events/user-registered.event';
import { UserAlreadyExistsError, InvalidPasswordLengthError } from '@domain/errors/auth-errors';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import type { PasswordHasherPort } from '@domain/ports/out/password-hasher.port';
import type { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';
import type { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import type { RegisterUserInputDto, AuthTokensResponseDto } from '@application/dtos/auth.dto';

export interface IRegisterUserUseCase {
    execute(dto: RegisterUserInputDto): Promise<AuthTokensResponseDto>;
}

export class RegisterUserUseCase implements IRegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepositoryPort,
        private readonly passwordHasher: PasswordHasherPort,
        private readonly tokenGenerator: TokenGeneratorPort,
        private readonly eventPublisher: EventPublisherPort,
    ) { }

    async execute(dto: RegisterUserInputDto): Promise<AuthTokensResponseDto> {
        if (dto.password.length < 8) {
            throw new InvalidPasswordLengthError();
        }

        const existingUser = await this.userRepository.findByEmail(dto.email.toLowerCase().trim());
        if (existingUser) {
            throw new UserAlreadyExistsError(dto.email);
        }

        const passwordHash = await this.passwordHasher.hash(dto.password);
        const userId = randomUUID();

        const newUser = User.create(dto.name, dto.email, passwordHash, userId);
        await this.userRepository.save(newUser);

        const event = new UserRegisteredEvent(newUser.id, newUser.name, newUser.email);
        await this.eventPublisher.publishUserRegistered(event);

        const tokenPayload = { userId: newUser.id, email: newUser.email };
        const accessToken = this.tokenGenerator.generateAccessToken(tokenPayload);
        const refreshToken = this.tokenGenerator.generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        };
    }
}