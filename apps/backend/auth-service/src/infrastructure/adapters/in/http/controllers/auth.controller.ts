import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { AUTH_DI_TOKENS } from '@infrastructure/di/tokens';
import { RegisterUserInputDto, LoginUserInputDto, AuthTokensResponseDto } from '@application/dtos/auth.dto';
import type { ILoginUserUseCase } from '@application/dtos/in/login-user.use-case';
import type { IRegisterUserUseCase } from '@application/dtos/in/register-user.use-case';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(
        @Inject(AUTH_DI_TOKENS.REGISTER_USER_PORT)
        private readonly registerUserUseCase: IRegisterUserUseCase,
        @Inject(AUTH_DI_TOKENS.LOGIN_USER_PORT)
        private readonly loginUserUseCase: ILoginUserUseCase,
    ) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: HttpStatus.CREATED, type: AuthTokensResponseDto, description: 'User successfully registered' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid password length or input' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already exists' })
    async register(@Body() dto: RegisterUserInputDto) {
        return this.registerUserUseCase.execute(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Log in an existing user' })
    @ApiResponse({ status: HttpStatus.OK, type: AuthTokensResponseDto, description: 'User successfully logged in' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    async login(@Body() dto: LoginUserInputDto) {
        return this.loginUserUseCase.execute(dto);
    }
}