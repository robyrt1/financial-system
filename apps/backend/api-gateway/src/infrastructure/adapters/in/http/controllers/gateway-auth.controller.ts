import {
  All,
  Controller,
  Inject,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Body,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { type RouteRequestPort } from '@domain/ports/in/route-request.port';
import {
  GatewayAuthGuard,
  type AuthenticatedRequest,
} from '@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  RegisterUserInputDto,
  LoginUserInputDto,
  AuthTokensResponseDto,
} from '@application/dtos/auth.dto';

@ApiTags('Auth Service')
@Controller('api/v1/auth')
export class GatewayAuthController {
  constructor(
    @Inject(DI_TOKENS.ROUTE_REQUEST_PORT)
    private readonly routeRequestPort: RouteRequestPort,
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
    description: 'Invalid input or password too short',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User email already exists',
  })
  async register(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: RegisterUserInputDto,
  ) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'register',
      method: 'POST',
      headers: req.headers,
      body,
      query: req.query,
    });
    return res.status(result.status).json(result.data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AuthTokensResponseDto,
    description: 'User successfully logged in or MFA token issued',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: LoginUserInputDto,
  ) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'login',
      method: 'POST',
      headers: req.headers,
      body,
      query: req.query,
    });
    return res.status(result.status).json(result.data);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify second factor TOTP code' })
  async verifyMfa(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: Record<string, unknown>,
  ) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'mfa/verify',
      method: 'POST',
      headers: req.headers,
      body,
      query: req.query,
    });
    return res.status(result.status).json(result.data);
  }

  @Post('mfa/setup')
  @UseGuards(GatewayAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup google authenticator TOTP' })
  async setupMfa(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'mfa/setup',
      method: 'POST',
      headers: req.headers,
      body: req.body,
      query: req.query,
      userId: req.user?.userId,
    });
    return res.status(result.status).json(result.data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate session tokens' })
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: Record<string, unknown>,
  ) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'refresh',
      method: 'POST',
      headers: req.headers,
      body,
      query: req.query,
    });
    return res.status(result.status).json(result.data);
  }

  @Post('logout')
  @UseGuards(GatewayAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke sessions' })
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'logout',
      method: 'POST',
      headers: req.headers,
      body: req.body,
      query: req.query,
      userId: req.user?.userId,
    });
    return res.status(result.status).json(result.data);
  }

  @Get('mfa/status')
  @UseGuards(GatewayAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user MFA status' })
  async getMfaStatus(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path: 'mfa/status',
      method: 'GET',
      headers: req.headers,
      body: req.body,
      query: req.query,
      userId: req.user?.userId,
    });
    return res.status(result.status).json(result.data);
  }

  @All('*')
  @ApiOperation({ summary: 'Catch-all proxy for Auth service' })
  async handleAuth(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const path = req.params[0] ?? '';
    const result = await this.routeRequestPort.execute({
      service: 'auth',
      path,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      userId: req.user?.userId,
    });

    return res.status(result.status).json(result.data);
  }
}
