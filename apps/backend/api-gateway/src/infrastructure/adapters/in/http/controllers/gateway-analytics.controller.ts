import { All, Controller, Inject, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import {
    type RouteRequestPort,
} from '@domain/ports/in/route-request.port';
import {
    GatewayAuthGuard,
    type AuthenticatedRequest,
} from '@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('Analytics')
@Controller('api/v1/analytics')
@UseGuards(GatewayAuthGuard)
export class GatewayAnalyticsController {
    constructor(
        @Inject(DI_TOKENS.ROUTE_REQUEST_PORT)
        private readonly routeRequestPort: RouteRequestPort,
    ) { }

    @All('*')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Proxy to Analytics microservice (requires authorization)' })
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