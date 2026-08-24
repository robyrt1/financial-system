import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserInputDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  name!: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The password of the user (min 8 characters)',
    example: 'password123',
  })
  password!: string;
}

export class LoginUserInputDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password!: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'JWT Access Token', required: false })
  accessToken?: string;

  @ApiProperty({ description: 'JWT Refresh Token', required: false })
  refreshToken?: string;

  @ApiProperty({ type: UserResponseDto, required: false })
  user?: UserResponseDto;

  @ApiProperty({ description: 'Indica se MFA é requerido' })
  requiresMfa!: boolean;

  @ApiProperty({
    description: 'Token transitório de MFA (se requiresMfa for true)',
    required: false,
  })
  mfaToken?: string;
}

export class VerifyMfaInputDto {
  @ApiProperty({
    description: 'Token transitório de MFA com escopo mfa_pending',
    example: 'eyJhbGciOiJSUzI1...',
  })
  mfaToken!: string;

  @ApiProperty({
    description: 'Código TOTP de 6 dígitos gerado pelo Google Authenticator',
    example: '123456',
  })
  code!: string;
}

export class SetupMfaResponseDto {
  @ApiProperty({
    description: 'Chave secreta Base32 para configuração manual',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret!: string;

  @ApiProperty({
    description: 'URI otpauth para leitura de QR Code',
    example:
      'otpauth://totp/RMTECH:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=RMTECH',
  })
  qrCode!: string;
}

export class RefreshTokenInputDto {
  @ApiProperty({
    description: 'Opaque ou JWT Refresh Token',
    example: 'eyJhbGciOiJSUzI1...',
  })
  refreshToken!: string;
}
