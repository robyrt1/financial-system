import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserInputDto {
    @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
    name!: string;

    @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
    email!: string;

    @ApiProperty({ description: 'The password of the user (min 8 characters)', example: 'password123' })
    password!: string;
}

export class LoginUserInputDto {
    @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
    email!: string;

    @ApiProperty({ description: 'The password of the user', example: 'password123' })
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
    @ApiProperty({ description: 'JWT Access Token' })
    accessToken!: string;

    @ApiProperty({ description: 'JWT Refresh Token' })
    refreshToken!: string;

    @ApiProperty({ type: UserResponseDto })
    user!: UserResponseDto;
}
