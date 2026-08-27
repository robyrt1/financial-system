import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Inject,
  Param,
  HttpStatus,
  HttpException,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { FINANCIAL_DI_TOKENS } from "@infrastructure/di/tokens";
import type { GetAccountsSummaryPort } from "@domain/ports/in/get-accounts-summary.port";
import type { ManageAccountPort } from "@domain/ports/in/manage-account.port";
import type { ManageCreditCardPort } from "@domain/ports/in/manage-credit-card.port";
import type { GetInvoiceProjectionsPort } from "@domain/ports/in/get-invoice-projections.port";
import type { PayInvoicePort } from "@domain/ports/in/pay-invoice.port";
import {
  CreateAccountDto,
  CreateCreditCardDto,
  AdjustLimitDto,
  PayInvoiceDto,
} from "@application/dtos/financial.dto";
import { CurrentUser } from "@infrastructure/adapters/in/http/decorators/current-user.decorator";
import type { InternalUserContext } from "@infrastructure/adapters/in/http/decorators/current-user.decorator";
import {
  RoleGuard,
  Roles,
} from "@infrastructure/adapters/in/http/guards/role.guard";

@ApiTags("Financial Operations")
@Controller("v1")
@UseGuards(RoleGuard)
@Roles("user", "admin", "client")
export class FinancialController {
  constructor(
    @Inject(FINANCIAL_DI_TOKENS.GET_ACCOUNTS_SUMMARY_PORT)
    private readonly getAccountsSummaryPort: GetAccountsSummaryPort,
    @Inject(FINANCIAL_DI_TOKENS.MANAGE_ACCOUNT_PORT)
    private readonly manageAccountPort: ManageAccountPort,
    @Inject(FINANCIAL_DI_TOKENS.MANAGE_CREDIT_CARD_PORT)
    private readonly manageCreditCardPort: ManageCreditCardPort,
    @Inject(FINANCIAL_DI_TOKENS.GET_INVOICE_PROJECTIONS_PORT)
    private readonly getInvoiceProjectionsPort: GetInvoiceProjectionsPort,
    @Inject(FINANCIAL_DI_TOKENS.PAY_INVOICE_PORT)
    private readonly payInvoicePort: PayInvoicePort,
  ) {}

  @Get("accounts/summary")
  @ApiOperation({ summary: "Get upper KPI summary card calculations" })
  async getSummary(@CurrentUser() user: InternalUserContext) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    return this.getAccountsSummaryPort.execute(user.userId);
  }

  @Get("accounts")
  @ApiOperation({ summary: "List all accounts for the user" })
  async listAccounts(@CurrentUser() user: InternalUserContext) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    return this.manageAccountPort.listAccounts(user.userId);
  }

  @Post("accounts")
  @ApiOperation({ summary: "Create a new bank account or wallet" })
  async createAccount(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: CreateAccountDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      return await this.manageAccountPort.createAccount({
        userId: user.userId,
        name: dto.name,
        type: dto.type,
        encryptedDetails: dto.encryptedDetails,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("credit-cards")
  @ApiOperation({ summary: "List all credit cards for the user" })
  async listCreditCards(@CurrentUser() user: InternalUserContext) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    return this.manageCreditCardPort.listCreditCards(user.userId);
  }

  @Post("credit-cards")
  @ApiOperation({ summary: "Register a new physical/virtual credit card" })
  async createCreditCard(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: CreateCreditCardDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      return await this.manageCreditCardPort.createCreditCard({
        userId: user.userId,
        accountId: dto.accountId,
        cardName: dto.cardName,
        creditLimit: dto.creditLimit,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        maskedDigits: dto.maskedDigits,
        encryptedPayload: dto.encryptedPayload,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch("credit-cards/:id/limit")
  @ApiOperation({ summary: "Adjust the credit limit of a card" })
  async adjustLimit(
    @CurrentUser() user: InternalUserContext,
    @Param("id") cardId: string,
    @Body() dto: AdjustLimitDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      return await this.manageCreditCardPort.adjustLimit(
        user.userId,
        cardId,
        dto.newLimit,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("credit-cards/:id/pay")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pay and clear a credit card invoice" })
  async payInvoice(
    @CurrentUser() user: InternalUserContext,
    @Param("id") cardId: string,
    @Body() dto: PayInvoiceDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      await this.payInvoicePort.execute(user.userId, {
        creditCardId: cardId,
        month: dto.month,
        year: dto.year,
        sourceAccountId: dto.sourceAccountId,
      });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("invoices/projections")
  @ApiOperation({ summary: "Get monthly consolidated invoice projections" })
  async getProjections(@CurrentUser() user: InternalUserContext) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    return this.getInvoiceProjectionsPort.execute(user.userId);
  }
}
