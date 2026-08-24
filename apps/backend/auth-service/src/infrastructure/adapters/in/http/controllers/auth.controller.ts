import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Get,
  Headers,
} from '@nestjs/common';
import { AUTH_DI_TOKENS } from '@infrastructure/di/tokens';
import {
  RegisterUserInputDto,
  LoginUserInputDto,
  AuthTokensResponseDto,
  VerifyMfaInputDto,
  SetupMfaResponseDto,
  RefreshTokenInputDto,
} from '@application/dtos/auth.dto';
import type { IRegisterUserUseCase } from '@domain/ports/in/register-user.port';
import type { ILoginUserUseCase } from '@domain/ports/in/login-user.port';
import type { IVerifyMfaUseCase } from '@domain/ports/in/verify-mfa.port';
import type { ISetupMfaUseCase } from '@domain/ports/in/setup-mfa.port';
import type { IRefreshTokenUseCase } from '@domain/ports/in/refresh-token.port';
import type { ILogoutUseCase } from '@domain/ports/in/logout.port';
import type { IGetMfaStatusUseCase } from '@domain/ports/in/get-mfa-status.port';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    @Inject(AUTH_DI_TOKENS.REGISTER_USER_PORT)
    private readonly registerUserUseCase: IRegisterUserUseCase,
    @Inject(AUTH_DI_TOKENS.LOGIN_USER_PORT)
    private readonly loginUserUseCase: ILoginUserUseCase,
    @Inject(AUTH_DI_TOKENS.VERIFY_MFA_PORT)
    private readonly verifyMfaUseCase: IVerifyMfaUseCase,
    @Inject(AUTH_DI_TOKENS.SETUP_MFA_PORT)
    private readonly setupMfaUseCase: ISetupMfaUseCase,
    @Inject(AUTH_DI_TOKENS.REFRESH_TOKEN_PORT)
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
    @Inject(AUTH_DI_TOKENS.LOGOUT_PORT)
    private readonly logoutUseCase: ILogoutUseCase,
    @Inject(AUTH_DI_TOKENS.GET_MFA_STATUS_PORT)
    private readonly getMfaStatusUseCase: IGetMfaStatusUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AuthTokensResponseDto,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid password length or input',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  async register(@Body() dto: RegisterUserInputDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AuthTokensResponseDto,
    description: 'User successfully logged in or MFA token emitted',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginUserInputDto) {
    return this.loginUserUseCase.execute(dto);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify second factor TOTP code' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AuthTokensResponseDto,
    description: 'MFA verified and session tokens issued',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid TOTP code or expired MFA token',
  })
  async verifyMfa(@Body() dto: VerifyMfaInputDto) {
    return this.verifyMfaUseCase.execute(dto);
  }

  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup google authenticator TOTP' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SetupMfaResponseDto,
    description: 'TOTP secret generated',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized context',
  })
  async setupMfa(@Headers('x-user-id') userId: string) {
    return this.setupMfaUseCase.execute(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate session tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AuthTokensResponseDto,
    description: 'Access and refresh tokens successfully rotated',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session expired or reuse detected',
  })
  async refresh(@Body() dto: RefreshTokenInputDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke all active sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessions successfully revoked',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized context',
  })
  async logout(@Headers('x-user-id') userId: string) {
    await this.logoutUseCase.execute(userId);
    return { success: true };
  }

  @Get('mfa/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user MFA status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns whether user has MFA enabled',
  })
  async getMfaStatus(@Headers('x-user-id') userId: string) {
    return this.getMfaStatusUseCase.execute(userId);
  }
}
