import { ApiProperty } from "@nestjs/swagger";
import type { AccountType } from "@domain/entities/account.entity";

export class EncryptedDetailsDto {
  @ApiProperty({ example: "e3b0c442..." })
  encryptedData!: string;

  @ApiProperty({ example: "f1d2c3..." })
  iv!: string;

  @ApiProperty({ example: "a1b2..." })
  authTag!: string;
}

export class CreateAccountDto {
  @ApiProperty({ example: "Conta Corrente RM" })
  name!: string;

  @ApiProperty({
    example: "CHECKING",
    enum: ["CHECKING", "SAVINGS", "INVESTMENT", "BUSINESS", "WALLET"],
  })
  type!: AccountType;

  @ApiProperty({ type: () => EncryptedDetailsDto })
  encryptedDetails!: EncryptedDetailsDto;
}

export class CreateCreditCardDto {
  @ApiProperty({ example: "d3b07384-d113-49d5-a504-204123456789" })
  accountId!: string;

  @ApiProperty({ example: "Nubank RMTECH" })
  cardName!: string;

  @ApiProperty({ example: 5000 })
  creditLimit!: number;

  @ApiProperty({ example: 10 })
  closingDay!: number;

  @ApiProperty({ example: 15 })
  dueDay!: number;

  @ApiProperty({ example: "•••• 4829" })
  maskedDigits!: string;

  @ApiProperty({ type: () => EncryptedDetailsDto })
  encryptedPayload!: EncryptedDetailsDto;
}

export class AdjustLimitDto {
  @ApiProperty({ example: 6000 })
  newLimit!: number;
}

export class PayInvoiceDto {
  @ApiProperty({ example: 8 })
  month!: number;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: "source-account-uuid" })
  sourceAccountId!: string;
}
