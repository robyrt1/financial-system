import type { DebtType } from "../../domain/entities/debt.entity";
import { ApiProperty } from "@nestjs/swagger";

export class DebtResponseDto {
  id!: string;
  userId!: string;
  creditorName!: string;
  type!: DebtType;
  originalAmount!: number;
  remainingBalance!: number;
  totalInstallments!: number;
  paidInstallments!: number;
  monthlyPayment!: number;
  monthlyInterestRate!: number;
  dueDay?: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class DebtsOverviewResponseDto {
  kpis!: {
    totalRemainingPassives: number;
    totalMonthlyCost: number;
    projectedPayoffDate: string;
    weightedAverageInterestRate: number;
  };
  activeContracts!: DebtResponseDto[];
  paidOffContracts!: DebtResponseDto[];
}

export class CreateDebtDto {
  @ApiProperty()
  creditorName!: string;

  @ApiProperty()
  type!: DebtType;

  @ApiProperty()
  originalAmount!: number;

  @ApiProperty()
  remainingBalance!: number;

  @ApiProperty()
  totalInstallments!: number;

  @ApiProperty()
  paidInstallments!: number;

  @ApiProperty()
  monthlyPayment!: number;

  @ApiProperty()
  monthlyInterestRate!: number;

  @ApiProperty({ required: false })
  dueDay?: number;

  @ApiProperty({ required: false })
  encryptedContractData?: string;
}

export class SimulateAmortizationDto {
  @ApiProperty()
  extraMonthlyAmount!: number;

  @ApiProperty()
  strategy!: "AVALANCHE" | "SNOWBALL";
}

export class SimulateAmortizationResponseDto {
  savedInterest!: number;
  reducedMonths!: number;
  originalPayoffYears!: number;
  newPayoffYears!: number;
  newPayoffDate!: string;
}

export class AmortizeDebtDto {
  @ApiProperty()
  amount!: number;

  @ApiProperty()
  sourceAccountId!: string;

  @ApiProperty()
  reductionType!: "TIME" | "PAYMENT";
}

export class PayDebtInstallmentDto {
  @ApiProperty()
  sourceAccountId!: string;
}
