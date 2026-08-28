import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { DeleteGoalPort } from "../../../domain/ports/in/goal-in.ports";
import {
  GoalRepositoryPort,
  GoalContributionRepositoryPort,
} from "../../../domain/ports/out/goal-repository.port";
import { AccountRepositoryPort } from "../../../domain/ports/out/account-repository.port";
import { TransactionRepositoryPort } from "../../../domain/ports/out/transaction-repository.port";
import { DeleteGoalDto } from "../../dtos/goal.dtos";
import { GoalNotFoundException } from "../../../domain/exceptions/goal.exceptions";
import { Transaction } from "../../../domain/entities/transaction.entity";

export class DeleteGoalUseCase implements DeleteGoalPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly goalRepository: GoalRepositoryPort,
    private readonly contributionRepository: GoalContributionRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    userId: string,
    goalId: string,
    data?: DeleteGoalDto,
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const goal = await this.goalRepository.findById(goalId, manager);
      if (!goal || goal.userId !== userId) {
        throw new GoalNotFoundException(goalId);
      }

      if (goal.currentAmount > 0 && goal.status !== "REDEEMED") {
        if (!data?.refundAccountId) {
          throw new Error(
            "É obrigatório informar uma conta (refundAccountId) para estorno do saldo acumulado da meta.",
          );
        }

        const account = await this.accountRepository.findById(
          data.refundAccountId,
          manager,
        );
        if (!account || account.userId !== userId) {
          throw new Error("Conta para estorno não encontrada.");
        }

        // Estorno
        account.balance = Number(account.balance) + goal.currentAmount;
        await this.accountRepository.save(account, manager);

        const transactionId = randomUUID();
        const transaction = new Transaction({
          id: transactionId,
          userId,
          accountId: account.id,
          categoryId: null,
          destinationAccountId: null,
          description: `Estorno (Exclusão da Meta): ${goal.name}`,
          amount: goal.currentAmount,
          type: "INCOME",
          status: "SETTLED",
          date: new Date().toISOString().substring(0, 10),
          tags: ["Meta", "Estorno", goal.name],
          paymentMethod: "ACCOUNT",
          installments: 1,
          encryptedDetails: null,
        });
        await this.transactionRepository.save(transaction, manager);
      }

      await this.contributionRepository.deleteByGoalId(goalId, manager);
      await this.goalRepository.delete(goalId, manager);
    });
  }
}
