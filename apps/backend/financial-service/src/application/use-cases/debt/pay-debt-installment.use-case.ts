import { PayDebtInstallmentPort } from "../../../domain/ports/in/debt-in.ports";
import { DebtRepositoryPort } from "../../../domain/ports/out/debt-repository.port";
import {
  DebtNotFoundException,
  DebtAlreadyPaidOffException,
} from "../../../domain/exceptions/debt.exceptions";
import { DebtResponseDto, PayDebtInstallmentDto } from "../../dtos/debt.dtos";
import { ManageTransactionPort } from "../../../domain/ports/in/manage-transaction.port";

export class PayDebtInstallmentUseCase implements PayDebtInstallmentPort {
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly manageTransactionPort: ManageTransactionPort,
  ) {}

  async execute(
    userId: string,
    debtId: string,
    data: PayDebtInstallmentDto,
  ): Promise<DebtResponseDto> {
    const debt = await this.debtRepository.findById(debtId);

    if (!debt || debt.userId !== userId) {
      throw new DebtNotFoundException(debtId);
    }

    if (debt.status === "PAID_OFF") {
      throw new DebtAlreadyPaidOffException(debtId);
    }

    // Simplificação do cálculo de amortização da parcela (tabela price aproximada)
    const interestPart =
      debt.remainingBalance * (debt.monthlyInterestRate / 100);
    let amortizedAmount = debt.monthlyPayment - interestPart;

    // Fallback caso a parcela seja menor que os juros
    if (amortizedAmount <= 0) {
      amortizedAmount = debt.monthlyPayment;
    }

    debt.payInstallment(amortizedAmount);

    // Gerar transação de despesa (EXPENSE) para o pagamento da parcela
    await this.manageTransactionPort.create(userId, {
      accountId: data.sourceAccountId,
      categoryId: null, // Hardcoded null conforme combinado no MVP
      destinationAccountId: null,
      description: `Pagamento Parcela - ${debt.creditorName}`,
      amount: debt.monthlyPayment,
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
