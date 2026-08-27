import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Inject,
  Param,
  Query,
  HttpStatus,
  HttpException,
  UseGuards,
  Res,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import type { Response } from "express";
import { FINANCIAL_DI_TOKENS } from "@infrastructure/di/tokens";
import type { ListTransactionsPort } from "@domain/ports/in/list-transactions.port";
import type { ManageTransactionPort } from "@domain/ports/in/manage-transaction.port";
import type { ExportTransactionsPort } from "@domain/ports/in/export-transactions.port";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  BulkTransactionActionDto,
  FilterTransactionsQueryDto,
} from "@application/dtos/transaction.dtos";
import { CurrentUser } from "@infrastructure/adapters/in/http/decorators/current-user.decorator";
import type { InternalUserContext } from "@infrastructure/adapters/in/http/decorators/current-user.decorator";
import {
  RoleGuard,
  Roles,
} from "@infrastructure/adapters/in/http/guards/role.guard";

@ApiTags("Transactions")
@Controller("v1/transactions")
@UseGuards(RoleGuard)
@Roles("user", "admin", "client")
@ApiBearerAuth()
export class TransactionController {
  constructor(
    @Inject(FINANCIAL_DI_TOKENS.LIST_TRANSACTIONS_PORT)
    private readonly listTransactionsPort: ListTransactionsPort,
    @Inject(FINANCIAL_DI_TOKENS.MANAGE_TRANSACTION_PORT)
    private readonly manageTransactionPort: ManageTransactionPort,
    @Inject(FINANCIAL_DI_TOKENS.EXPORT_TRANSACTIONS_PORT)
    private readonly exportTransactionsPort: ExportTransactionsPort,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all transactions with filters and metrics" })
  async list(
    @CurrentUser() user: InternalUserContext,
    @Query() query: FilterTransactionsQueryDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      return await this.listTransactionsPort.execute(user.userId, query);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  async create(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: CreateTransactionDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      return await this.manageTransactionPort.create(user.userId, {
        ...dto,
        categoryId: dto.categoryId ?? null,
        destinationAccountId: dto.destinationAccountId ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing transaction" })
  async update(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      return await this.manageTransactionPort.update(user.userId, id, dto);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a transaction" })
  async delete(
    @CurrentUser() user: InternalUserContext,
    @Param("id") id: string,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      await this.manageTransactionPort.delete(user.userId, id);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("bulk")
  @ApiOperation({ summary: "Execute bulk actions (settle or delete)" })
  async bulkAction(
    @CurrentUser() user: InternalUserContext,
    @Body() dto: BulkTransactionActionDto,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    try {
      await this.manageTransactionPort.bulkAction(user.userId, dto);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("export")
  @ApiOperation({ summary: "Export transactions as CSV or OFX" })
  async export(
    @CurrentUser() user: InternalUserContext,
    @Query("format") format: "csv" | "ofx",
    @Query() query: FilterTransactionsQueryDto,
    @Res() res: Response,
  ) {
    if (!user.userId)
      throw new HttpException(
        "User Context is missing",
        HttpStatus.BAD_REQUEST,
      );
    if (format !== "csv" && format !== "ofx") {
      throw new HttpException(
        'Formato inválido. Use "csv" ou "ofx".',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.exportTransactionsPort.execute(
        user.userId,
        format,
        query,
      );
      const contentType = format === "csv" ? "text/csv" : "text/xml";
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      return res.send(result.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }
}
