import { All, Controller, Inject, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import {
    type RouteRequestPort,
} from '@domain/ports/in/route-request.port.js';
import {
    GatewayAuthGuard,
    type AuthenticatedRequest,
} from '@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard.js';
import { DI_TOKENS } from '@infrastructure/di/tokens';

@Controller('api/v1')
export class GatewayController {
    constructor(
        @Inject(DI_TOKENS.ROUTE_REQUEST_PORT)
        private readonly routeRequestPort: RouteRequestPort,
    ) { }

    @All('auth/*')
    async handleAuth(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        const path = req.params[0] ?? '';
        const result = await this.routeRequestPort.execute({
            service: 'auth',
            path,
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
        });

        return res.status(result.status).json(result.data);
    }

    @All('core/*')
    @UseGuards(GatewayAuthGuard)
    async handleCoreBanking(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
    ) {
        const path = req.params[0] ?? '';
        const result = await this.routeRequestPort.execute({
            service: 'core-banking',
            path,
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
            userId: req.user?.userId,
        });

        return res.status(result.status).json(result.data);
    }

    @All('analytics/*')
    @UseGuards(GatewayAuthGuard)
    async handleAnalytics(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
    ) {
        const path = req.params[0] ?? '';
        const result = await this.routeRequestPort.execute({
            service: 'analytics',
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
