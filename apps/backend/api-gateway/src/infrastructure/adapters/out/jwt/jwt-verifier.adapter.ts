import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import { UserSession } from '@domain/entities/user-session.entity';
import { TokenExpiredOrInvalidError } from '@domain/errors/gateway-errors';

interface JwtPayload {
    sub: string;
    email: string;
    roles?: string[];
}

@Injectable()
export class JwtVerifierAdapter implements TokenVerifierPort {
    private readonly secret: string;

    constructor(configService: ConfigService) {
        this.secret = configService.get<string>('JWT_SECRET', 'default_jwt_secret');
    }

    async verify(token: string): Promise<UserSession> {
        try {
            const decoded = jwt.verify(token, this.secret) as JwtPayload;
            return new UserSession(decoded.sub, decoded.email, decoded.roles ?? []);
        } catch {
            throw new TokenExpiredOrInvalidError();
        }
    }
}