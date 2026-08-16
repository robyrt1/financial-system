import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedDirectAccessError } from '@domain/errors/auth-errors';

@Injectable()
export class InternalAuthMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) { }

    use(req: Request, _res: Response, next: NextFunction) {
        const expectedSecret = this.configService.get<string>('INTERNAL_SERVICE_KEY');
        const incomingSecret = req.headers['x-internal-secret'];

        if (!expectedSecret || incomingSecret !== expectedSecret) {
            throw new UnauthorizedDirectAccessError();
        }

        next();
    }
}