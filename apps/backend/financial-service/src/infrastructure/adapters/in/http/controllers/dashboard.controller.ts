import {
  Controller,
  Get,
  UseGuards,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import {
  RoleGuard,
  Roles,
} from "@infrastructure/adapters/in/http/guards/role.guard";
import * as currentUserDecorator from "@infrastructure/adapters/in/http/decorators/current-user.decorator";
import { FINANCIAL_DI_TOKENS } from "@infrastructure/di/tokens";
import * as getDashboardMetricsPort_1 from "@domain/ports/in/get-dashboard-metrics.port";

@ApiTags("Dashboard Metrics")
@Controller("v1/dashboard")
@UseGuards(RoleGuard)
@Roles("user", "admin", "client")
@ApiBearerAuth()
export class DashboardController {
  constructor(
    @Inject(FINANCIAL_DI_TOKENS.GET_DASHBOARD_METRICS_PORT)
    private readonly getDashboardMetricsPort: getDashboardMetricsPort_1.GetDashboardMetricsPort,
  ) {}

  @Get("metrics")
  @ApiOperation({ summary: "Get aggregated dashboard metrics" })
  async getMetrics(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.InternalUserContext,
  ) {
    if (!user.userId) {
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.getDashboardMetricsPort.execute(user.userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
