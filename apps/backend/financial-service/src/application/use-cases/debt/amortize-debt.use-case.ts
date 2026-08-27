import { AmortizeDebtPort } from "../../../domain/ports/in/debt-in.ports";
import { DebtRepositoryPort } from "../../../domain/ports/out/debt-repository.port";
import {
  DebtNotFoundException,
  InvalidAmortizationAmountException,
  DebtAlreadyPaidOffException,
} from "../../../domain/exceptions/debt.exceptions";
import { AmortizeDebtDto, DebtResponseDto } from "../../dtos/debt.dtos";
import { ManageTransactionPort } from "../../../domain/ports/in/manage-transaction.port";

export class AmortizeDebtUseCase implements AmortizeDebtPort {
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly manageTransactionPort: ManageTransactionPort,
  ) {}

  async execute(
    userId: string,
    debtId: string,
    data: AmortizeDebtDto,
  ): Promise<DebtResponseDto> {
    const debt = await this.debtRepository.findById(debtId);

    if (!debt || debt.userId !== userId) {
      throw new DebtNotFoundException(debtId);
    }

    if (debt.status === "PAID_OFF") {
      throw new DebtAlreadyPaidOffException(debtId);
    }

    if (data.amount <= 0) {
      throw new InvalidAmortizationAmountException(
        "Amount must be greater than zero",
      );
    }

    debt.amortizeExtraordinary(data.amount);

    // Gerar transação de despesa (EXPENSE) para a amortização
    await this.manageTransactionPort.create(userId, {
      accountId: data.sourceAccountId,
      categoryId: null, // Hardcoded null conforme combinado no MVP
      destinationAccountId: null,
      description: `Amortização - ${debt.creditorName}`,
      amount: data.amount,
      type: "EXPENSE",
      status: "SETTLED",
      date: new Date().toISOString().substring(0, 10),
      paymentMethod: "ACCOUNT",
    });

    const savedDebt = await this.debtRepository.save(debt);
    return {
      id: savedDebt.id as string,
      userId: savedDebt.userId,
      creditorName: savedDebt.creditorName,
      type: savedDebt.type,
      originalAmount: savedDebt.originalAmount,
      remainingBalance: savedDebt.remainingBalance,
      totalInstallments: savedDebt.totalInstallments,
      paidInstallments: savedDebt.paidInstallments,
      monthlyPayment: savedDebt.monthlyPayment,
      monthlyInterestRate: savedDebt.monthlyInterestRate,
      dueDay: savedDebt.dueDay,
      status: savedDebt.status,
      createdAt: savedDebt.createdAt,
      updatedAt: savedDebt.updatedAt,
    };
  }
}
