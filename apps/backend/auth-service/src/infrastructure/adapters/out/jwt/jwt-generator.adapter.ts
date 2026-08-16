import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenGeneratorPort, TokenPayload } from '@domain/ports/out/token-generator.port';

@Injectable()
export class JwtGeneratorAdapter implements TokenGeneratorPort {
    private readonly secret: string;

    constructor(configService: ConfigService) {
        this.secret = configService.get<string>('JWT_SECRET', 'default_jwt_secret');
    }

    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(
            { sub: payload.userId, email: payload.email, roles: payload.roles ?? [] },
            this.secret,
            { expiresIn: '15m' },
        );
    }

    generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(
            { sub: payload.userId },
            this.secret,
            { expiresIn: '7d' },
        );
    }
}