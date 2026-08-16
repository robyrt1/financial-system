import { LoginUserInputDto, AuthTokensResponseDto } from '@application/dtos/auth.dto';
import { InvalidCredentialsError } from '@domain/errors/auth-errors';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import type { PasswordHasherPort } from '@domain/ports/out/password-hasher.port';
import type { TokenGeneratorPort } from '@domain/ports/out/token-generator.port';

export interface ILoginUserUseCase {
    execute(dto: LoginUserInputDto): Promise<AuthTokensResponseDto>;
}

export class LoginUserUseCase implements ILoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepositoryPort,
        private readonly passwordHasher: PasswordHasherPort,
        private readonly tokenGenerator: TokenGeneratorPort,
    ) { }

    async execute(dto: LoginUserInputDto): Promise<AuthTokensResponseDto> {
        const user = await this.userRepository.findByEmail(dto.email.toLowerCase().trim());
        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isMatch = await this.passwordHasher.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new InvalidCredentialsError();
        }

        const tokenPayload = { userId: user.id, email: user.email };
        const accessToken = this.tokenGenerator.generateAccessToken(tokenPayload);
        const refreshToken = this.tokenGenerator.generateRefreshToken(tokenPayload);

        return {
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