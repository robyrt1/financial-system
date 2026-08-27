import { GetDebtsOverviewPort } from "../../../domain/ports/in/debt-in.ports";
import { DebtRepositoryPort } from "../../../domain/ports/out/debt-repository.port";
import {
  DebtsOverviewResponseDto,
  DebtResponseDto,
} from "../../dtos/debt.dtos";
import { Debt } from "../../../domain/entities/debt.entity";

export class GetDebtsOverviewUseCase implements GetDebtsOverviewPort {
  constructor(private readonly debtRepository: DebtRepositoryPort) {}

  async execute(
    userId: string,
    strategy: "AVALANCHE" | "SNOWBALL",
  ): Promise<DebtsOverviewResponseDto> {
    const activeContracts =
      strategy === "AVALANCHE"
        ? await this.debtRepository.findAllActiveByUserIdOrderByInterestDesc(
            userId,
          )
        : await this.debtRepository.findAllActiveByUserIdOrderByBalanceAsc(
            userId,
          );

    const paidOffContracts = await this.debtRepository.findByUserIdAndStatus(
      userId,
      "PAID_OFF",
    );

    let totalRemainingPassives = 0;
    let totalMonthlyCost = 0;
    let maxRemainingInstallments = 0;
    let weightedInterestSum = 0;

    for (const debt of activeContracts) {
      totalRemainingPassives += debt.remainingBalance;
      totalMonthlyCost += debt.monthlyPayment;

      const remainingInstallments =
        debt.totalInstallments - debt.paidInstallments;
      if (remainingInstallments > maxRemainingInstallments) {
        maxRemainingInstallments = remainingInstallments;
      }

      weightedInterestSum += debt.remainingBalance * debt.monthlyInterestRate;
    }

    const weightedAverageInterestRate =
      totalRemainingPassives > 0
        ? weightedInterestSum / totalRemainingPassives
        : 0;

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + maxRemainingInstallments);
    const projectedPayoffDate = payoffDate.toISOString();

    const mapDebtToDto = (debt: Debt): DebtResponseDto => ({
      id: debt.id as string,
      userId: debt.userId,
      creditorName: debt.creditorName,
      type: debt.type,
      originalAmount: debt.originalAmount,
      remainingBalance: debt.remainingBalance,
      totalInstallments: debt.totalInstallments,
      paidInstallments: debt.paidInstallments,
      monthlyPayment: debt.monthlyPayment,
      monthlyInterestRate: debt.monthlyInterestRate,
      dueDay: debt.dueDay,
      status: debt.status,
      createdAt: debt.createdAt,
      updatedAt: debt.updatedAt,
    });

    return {
      kpis: {
        totalRemainingPassives,
        totalMonthlyCost,
        projectedPayoffDate,
        weightedAverageInterestRate,
      },
      activeContracts: activeContracts.map(mapDebtToDto),
      paidOffContracts: paidOffContracts.map(mapDebtToDto),
    };
  }
}
