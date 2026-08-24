import { All, Controller, Inject, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { type RouteRequestPort } from '@domain/ports/in/route-request.port';
import {
  GatewayAuthGuard,
  type AuthenticatedRequest,
} from '@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Core Banking')
@Controller('api/v1/core')
@UseGuards(GatewayAuthGuard)
export class GatewayCoreController {
  constructor(
    @Inject(DI_TOKENS.ROUTE_REQUEST_PORT)
    private readonly routeRequestPort: RouteRequestPort,
  ) {}

  @All('*')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Proxy to Core Banking microservice (requires authorization)',
  })
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
      userRole: req.user?.roles?.[0],
    });

    return res.status(result.status).json(result.data);
  }
}
