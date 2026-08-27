import { SimulateAmortizationPort } from "../../../domain/ports/in/debt-in.ports";
import { DebtRepositoryPort } from "../../../domain/ports/out/debt-repository.port";
import {
  SimulateAmortizationDto,
  SimulateAmortizationResponseDto,
} from "../../dtos/debt.dtos";
import { Debt } from "../../../domain/entities/debt.entity";

export class SimulateAmortizationUseCase implements SimulateAmortizationPort {
  constructor(private readonly debtRepository: DebtRepositoryPort) {}

  async execute(
    userId: string,
    data: SimulateAmortizationDto,
  ): Promise<SimulateAmortizationResponseDto> {
    const activeContracts =
      data.strategy === "AVALANCHE"
        ? await this.debtRepository.findAllActiveByUserIdOrderByInterestDesc(
            userId,
          )
        : await this.debtRepository.findAllActiveByUserIdOrderByBalanceAsc(
            userId,
          );

    if (activeContracts.length === 0) {
      return {
        savedInterest: 0,
        reducedMonths: 0,
        originalPayoffYears: 0,
        newPayoffYears: 0,
        newPayoffDate: new Date().toISOString(),
      };
    }

    // Deep copy for simulation
    const baseDebts = activeContracts.map((d) => d.clone());
    const simDebts = activeContracts.map((d) => d.clone());

    const baseResult = this.simulate(baseDebts, 0, data.strategy);
    const acceleratedResult = this.simulate(
      simDebts,
      data.extraMonthlyAmount,
      data.strategy,
    );

    const savedInterest = Math.max(
      0,
      baseResult.totalInterest - acceleratedResult.totalInterest,
    );
    const reducedMonths = Math.max(
      0,
      baseResult.monthsTaken - acceleratedResult.monthsTaken,
    );

    const newPayoffDate = new Date();
    newPayoffDate.setMonth(
      newPayoffDate.getMonth() + acceleratedResult.monthsTaken,
    );

    return {
      savedInterest,
      reducedMonths,
      originalPayoffYears: parseFloat((baseResult.monthsTaken / 12).toFixed(1)),
      newPayoffYears: parseFloat(
        (acceleratedResult.monthsTaken / 12).toFixed(1),
      ),
      newPayoffDate: newPayoffDate.toISOString(),
    };
  }

  private simulate(
    debts: Debt[],
    extraMonthlyAmount: number,
    strategy: string,
  ): { monthsTaken: number; totalInterest: number } {
    let months = 0;
    let totalInterestPaid = 0;
    const MAX_MONTHS = 600; // Proteção contra loop infinito (50 anos)

    while (debts.some((d) => d.remainingBalance > 0) && months < MAX_MONTHS) {
      months++;
      let extraAvailable = extraMonthlyAmount;
      let freedUpPayments = 0;

      // 1. Pagamento normal de cada dívida
      for (const debt of debts) {
        if (debt.remainingBalance <= 0) {
          // A dívida já estava quitada, o pagamento normal dela vira "efeito bola de neve"
          freedUpPayments += debt.monthlyPayment;
          continue;
        }

        const interest =
          debt.remainingBalance * (debt.monthlyInterestRate / 100);
        totalInterestPaid += interest;

        debt.amortizeExtraordinary(-interest); // Adiciona o juros ao saldo

        if (debt.remainingBalance <= debt.monthlyPayment) {
          // Quita a dívida e o que sobrar da parcela vai pro extraAvailable (Bola de neve)
          extraAvailable += debt.monthlyPayment - debt.remainingBalance;
          debt.amortizeExtraordinary(debt.remainingBalance);
        } else {
          debt.amortizeExtraordinary(debt.monthlyPayment);
        }
      }

      extraAvailable += freedUpPayments;

      // 2. Aplicação do valor extra na dívida prioritária
      if (extraAvailable > 0) {
        // Re-ordena caso os saldos tenham mudado (especialmente para Snowball)
        if (strategy === "SNOWBALL") {
          debts.sort((a, b) => a.remainingBalance - b.remainingBalance);
        } else {
          debts.sort((a, b) => b.monthlyInterestRate - a.monthlyInterestRate);
        }

        for (const debt of debts) {
          if (extraAvailable <= 0) break;
          if (debt.remainingBalance <= 0) continue;

          if (debt.remainingBalance <= extraAvailable) {
            extraAvailable -= debt.remainingBalance;
            debt.amortizeExtraordinary(debt.remainingBalance);
          } else {
            debt.amortizeExtraordinary(extraAvailable);
            extraAvailable = 0;
          }
        }
      }
    }

    return { monthsTaken: months, totalInterest: totalInterestPaid };
  }
}
