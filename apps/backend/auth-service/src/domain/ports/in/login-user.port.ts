export class RegisterUserInputDto {
  name!: string;
  email!: string;
  password!: string;
}

export class LoginUserInputDto {
  email!: string;
  password!: string;
}

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class AuthTokensResponseDto {
  requiresMfa!: boolean;
  mfaToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: UserResponseDto;
}

export interface ILoginUserUseCase {
  execute(dto: LoginUserInputDto): Promise<AuthTokensResponseDto>;
}
