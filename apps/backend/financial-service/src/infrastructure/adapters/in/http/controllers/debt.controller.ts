import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current-user.decorator";
import type { InternalUserContext } from "../decorators/current-user.decorator";
import { RoleGuard } from "../guards/role.guard";
import {
  CreateDebtDto,
  SimulateAmortizationDto,
  AmortizeDebtDto,
  PayDebtInstallmentDto,
} from "../../../../../application/dtos/debt.dtos";

// Injection Tokens for Ports (these will be defined in tokens.ts)
import { Inject } from "@nestjs/common";
import type {
  GetDebtsOverviewPort,
  CreateDebtPort,
  PayDebtInstallmentPort,
  AmortizeDebtPort,
  SimulateAmortizationPort,
} from "../../../../../domain/ports/in/debt-in.ports";
import { DEBT_IN_PORTS } from "../../../../di/tokens";

@ApiTags("debts")
@ApiBearerAuth()
@UseGuards(RoleGuard)
@Controller("v1/debts")
export class DebtController {
  constructor(
    @Inject(DEBT_IN_PORTS.GET_OVERVIEW)
    private readonly getOverviewPort: GetDebtsOverviewPort,
    @Inject(DEBT_IN_PORTS.CREATE)
    private readonly createDebtPort: CreateDebtPort,
    @Inject(DEBT_IN_PORTS.PAY_INSTALLMENT)
    private readonly payInstallmentPort: PayDebtInstallmentPort,
    @Inject(DEBT_IN_PORTS.AMORTIZE)
    private readonly amortizePort: AmortizeDebtPort,
    @Inject(DEBT_IN_PORTS.SIMULATE)
    private readonly simulatePort: SimulateAmortizationPort,
  ) {}

  @Get("overview")
  @ApiOperation({
    summary: "Get debts overview KPIs and sorted active contracts",
  })
  @ApiQuery({ name: "strategy", enum: ["AVALANCHE", "SNOWBALL"] })
  async getOverview(
    @CurrentUser() user: InternalUserContext,
    @Query("strategy") strategy: "AVALANCHE" | "SNOWBALL",
  ) {
    return await this.getOverviewPort.execute(user.userId, strategy);
  }

  @Post()
  @ApiOperation({ summary: "Create a new debt contract" })
  async createDebt(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: CreateDebtDto,
  ) {
    return await this.createDebtPort.execute(user.userId, dto);
  }

  @Post(":id/pay-installment")
  @ApiOperation({ summary: "Pay the next installment of a debt" })
  async payInstallment(
    @CurrentUser() user: InternalUserContext,
    @Param("id") debtId: string,
    @Body() dto: PayDebtInstallmentDto,
  ) {
    return await this.payInstallmentPort.execute(user.userId, debtId, dto);
  }

  @Post(":id/amortize")
  @ApiOperation({ summary: "Amortize extra amount to a debt" })
  async amortizeDebt(
    @CurrentUser() user: InternalUserContext,
    @Param("id") debtId: string,
    @Body() dto: AmortizeDebtDto,
  ) {
    return await this.amortizePort.execute(user.userId, debtId, dto);
  }

  @Post("simulate")
  @ApiOperation({ summary: "Simulate amortization snowball/avalanche logic" })
  async simulateAmortization(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: SimulateAmortizationDto,
  ) {
    return await this.simulatePort.execute(user.userId, dto);
  }
}
