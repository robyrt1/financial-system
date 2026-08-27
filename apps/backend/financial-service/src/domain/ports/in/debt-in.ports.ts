import {
  CreateDebtDto,
  SimulateAmortizationDto,
  SimulateAmortizationResponseDto,
  AmortizeDebtDto,
  DebtsOverviewResponseDto,
  DebtResponseDto,
  PayDebtInstallmentDto,
} from "../../../application/dtos/debt.dtos";

export interface GetDebtsOverviewPort {
  execute(
    userId: string,
    strategy: "AVALANCHE" | "SNOWBALL",
  ): Promise<DebtsOverviewResponseDto>;
}

export interface CreateDebtPort {
  execute(userId: string, data: CreateDebtDto): Promise<DebtResponseDto>;
}

export interface PayDebtInstallmentPort {
  execute(
    userId: string,
    debtId: string,
    data: PayDebtInstallmentDto,
  ): Promise<DebtResponseDto>;
}

export interface AmortizeDebtPort {
  execute(
    userId: string,
    debtId: string,
    data: AmortizeDebtDto,
  ): Promise<DebtResponseDto>;
}

export interface SimulateAmortizationPort {
  execute(
    userId: string,
    data: SimulateAmortizationDto,
  ): Promise<SimulateAmortizationResponseDto>;
}
