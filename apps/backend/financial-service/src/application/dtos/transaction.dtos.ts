import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EncryptedDetailsDto } from "./financial.dto";

export class CreateTransactionDto {
  @ApiPropertyOptional({ example: "d3b07384-d113-49d5-a504-204123456789" })
  accountId?: string;

  @ApiPropertyOptional({
    example: "c1b07384-d113-49d5-a504-204123456789",
    nullable: true,
  })
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: "e3b07384-d113-49d5-a504-204123456789",
    nullable: true,
  })
  destinationAccountId?: string | null;

  @ApiProperty({ example: "Assinatura Cloud RMTECH" })
  description!: string;

  @ApiProperty({ example: 1840 })
  amount!: number;

  @ApiProperty({ example: "EXPENSE", enum: ["INCOME", "EXPENSE", "TRANSFER"] })
  type!: "INCOME" | "EXPENSE" | "TRANSFER";

  @ApiProperty({
    example: "SETTLED",
    enum: ["SETTLED", "PENDING", "SCHEDULED"],
  })
  status!: "SETTLED" | "PENDING" | "SCHEDULED";

  @ApiProperty({ example: "2026-08-25" })
  date!: string;

  @ApiPropertyOptional({ example: ["cybersecurity", "saas"] })
  tags?: string[];

  @ApiPropertyOptional({ type: () => EncryptedDetailsDto, nullable: true })
  encryptedDetails?: EncryptedDetailsDto | null;

  @ApiPropertyOptional({ example: "ACCOUNT", enum: ["ACCOUNT", "CREDIT_CARD"] })
  paymentMethod?: "ACCOUNT" | "CREDIT_CARD";

  @ApiPropertyOptional({ example: "cc-uuid-here" })
  creditCardId?: string;

  @ApiPropertyOptional({ example: 1 })
  installments?: number;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: "d3b07384-d113-49d5-a504-204123456789" })
  accountId?: string;

  @ApiPropertyOptional({
    example: "c1b07384-d113-49d5-a504-204123456789",
    nullable: true,
  })
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: "e3b07384-d113-49d5-a504-204123456789",
    nullable: true,
  })
  destinationAccountId?: string | null;

  @ApiPropertyOptional({ example: "Assinatura Cloud RMTECH v2" })
  description?: string;

  @ApiPropertyOptional({ example: 2000 })
  amount?: number;

  @ApiPropertyOptional({
    example: "EXPENSE",
    enum: ["INCOME", "EXPENSE", "TRANSFER"],
  })
  type?: "INCOME" | "EXPENSE" | "TRANSFER";

  @ApiPropertyOptional({
    example: "SETTLED",
    enum: ["SETTLED", "PENDING", "SCHEDULED"],
  })
  status?: "SETTLED" | "PENDING" | "SCHEDULED";

  @ApiPropertyOptional({ example: "2026-08-26" })
  date?: string;

  @ApiPropertyOptional({ example: ["cybersecurity", "saas"] })
  tags?: string[];

  @ApiPropertyOptional({ type: () => EncryptedDetailsDto, nullable: true })
  encryptedDetails?: EncryptedDetailsDto | null;
}

export class BulkTransactionActionDto {
  @ApiProperty({ example: ["tx-1", "tx-2"] })
  transactionIds!: string[];

  @ApiProperty({ example: "SETTLE", enum: ["SETTLE", "DELETE"] })
  action!: "SETTLE" | "DELETE";
}

export class FilterTransactionsQueryDto {
  @ApiPropertyOptional({ example: "RMTECH" })
  search?: string;

  @ApiPropertyOptional({
    example: "EXPENSE",
    enum: ["INCOME", "EXPENSE", "TRANSFER"],
  })
  type?: string;

  @ApiPropertyOptional({
    example: "SETTLED",
    enum: ["SETTLED", "PENDING", "SCHEDULED"],
  })
  status?: string;

  @ApiPropertyOptional({ example: "d3b07384-d113-49d5-a504-204123456789" })
  accountId?: string;

  @ApiPropertyOptional({ example: "c1b07384-d113-49d5-a504-204123456789" })
  categoryId?: string;

  @ApiPropertyOptional({ example: "2026-08-01" })
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-08-31" })
  endDate?: string;

  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  limit?: number;
}
