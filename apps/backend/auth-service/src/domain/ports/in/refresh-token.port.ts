import { AuthTokensResponseDto } from './login-user.port';

export class RefreshTokenInputDto {
  refreshToken!: string;
}

export interface IRefreshTokenUseCase {
  execute(dto: RefreshTokenInputDto): Promise<AuthTokensResponseDto>;
}
