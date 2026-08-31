import { Injectable } from "@nestjs/common";
import type { DeleteTransactionPort } from "@domain/ports/in/delete-transaction.port";
import type { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import type { UnitOfWorkPort } from "@domain/ports/out/unit-of-work.port";
import { AccountTransactionStrategy } from "./strategies/account-transaction.strategy";
import { CreditCardTransactionStrategy } from "./strategies/credit-card-transaction.strategy";

@Injectable()
export class DeleteTransactionUseCase implements DeleteTransactionPort {
  constructor(
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly accountStrategy: AccountTransactionStrategy,
    private readonly creditCardStrategy: CreditCardTransactionStrategy,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    return this.unitOfWork.executeInTransaction(async () => {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction || transaction.userId !== userId) {
        throw new Error("Transação não encontrada.");
      }

      const strategy =
        transaction.paymentMethod === "CREDIT_CARD"
          ? this.creditCardStrategy
          : this.accountStrategy;
      await strategy.revertEffects(transaction);

      await this.transactionRepository.delete(id);
    });
  }
}
