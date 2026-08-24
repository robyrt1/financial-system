import { AuthTokensResponseDto } from './login-user.port';

export class VerifyMfaInputDto {
  mfaToken!: string;
  code!: string;
}

export interface IVerifyMfaUseCase {
  execute(dto: VerifyMfaInputDto): Promise<AuthTokensResponseDto>;
}
