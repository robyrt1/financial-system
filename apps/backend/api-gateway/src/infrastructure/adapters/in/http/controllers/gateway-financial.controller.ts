import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayAuthGuard } from '@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard';
import { HttpProxyService } from '@infrastructure/adapters/out/proxy/http-proxy.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gateway Financial Proxy')
@Controller('api/v1')
@UseGuards(GatewayAuthGuard)
export class GatewayFinancialController {
  constructor(private readonly httpProxyService: HttpProxyService) {}

  @All(['accounts', 'accounts/*'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Proxy all accounts endpoints to Financial Service',
  })
  async handleAccounts(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['credit-cards', 'credit-cards/*'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Proxy all credit card endpoints to Financial Service',
  })
  async handleCreditCards(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['invoices', 'invoices/*'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy all invoice endpoints to Financial Service' })
  async handleInvoices(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['transactions', 'transactions/*'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Proxy all transaction endpoints to Financial Service',
  })
  async handleTransactions(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['categories', 'categories/*'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Proxy all categories endpoints to Financial Service',
  })
  async handleCategories(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['debts', 'debts/*'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy all debts endpoints to Financial Service' })
  async handleDebts(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['goals', 'goals/*'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy all goals endpoints to Financial Service' })
  async handleGoals(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }

  @All(['dashboard', 'dashboard/*'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Proxy all dashboard endpoints to Financial Service',
  })
  async handleDashboard(@Req() req: Request, @Res() res: Response) {
    this.httpProxyService.proxyFinancial(req, res);
  }
}
