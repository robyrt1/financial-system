import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { RedeemGoalPort } from "../../../domain/ports/in/goal-in.ports";
import { GoalRepositoryPort } from "../../../domain/ports/out/goal-repository.port";
import { AccountRepositoryPort } from "../../../domain/ports/out/account-repository.port";
import { TransactionRepositoryPort } from "../../../domain/ports/out/transaction-repository.port";
import { RedeemGoalDto, GoalItemResponseDto } from "../../dtos/goal.dtos";
import { GoalNotFoundException } from "../../../domain/exceptions/goal.exceptions";
import { Transaction } from "../../../domain/entities/transaction.entity";

export class RedeemGoalUseCase implements RedeemGoalPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly goalRepository: GoalRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    userId: string,
    goalId: string,
    data: RedeemGoalDto,
  ): Promise<GoalItemResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const goal = await this.goalRepository.findById(goalId, manager);
      if (!goal || goal.userId !== userId) {
        throw new GoalNotFoundException(goalId);
      }

      if (goal.status === "REDEEMED") {
        throw new Error("Esta meta já foi resgatada.");
      }

      if (goal.currentAmount <= 0) {
        throw new Error("Não há saldo para resgatar nesta meta.");
      }

      const account = await this.accountRepository.findById(
        data.destinationAccountId,
        manager,
      );
      if (!account || account.userId !== userId) {
        throw new Error("Conta de destino não encontrada.");
      }

      // Depositar o valor resgatado na conta
      account.balance = Number(account.balance) + goal.currentAmount;
      await this.accountRepository.save(account, manager);

      // Registrar transação de entrada
      const transactionId = randomUUID();
      const transaction = new Transaction({
        id: transactionId,
        userId,
        accountId: account.id,
        categoryId: null,
        destinationAccountId: null,
        description: `Resgate da meta: ${goal.name}`,
        amount: goal.currentAmount,
        type: "INCOME",
        status: "SETTLED",
        date: new Date().toISOString().substring(0, 10),
        tags: ["Meta", "Resgate", goal.name],
        paymentMethod: "ACCOUNT",
        installments: 1,
        encryptedDetails: null,
      });
      await this.transactionRepository.save(transaction, manager);

      // Atualizar a meta para REDEEMED
      goal.redeem();
      const savedGoal = await this.goalRepository.save(goal, manager);

      return {
        id: savedGoal.id,
        name: savedGoal.name,
        targetAmount: savedGoal.targetAmount,
        currentAmount: savedGoal.currentAmount,
        deadline: savedGoal.deadline,
        monthsRemaining: 0,
        percentage: 100,
        suggestedMonthlyDeposit: 0,
        icon: savedGoal.icon,
        color: savedGoal.color,
        status: savedGoal.status,
        category: savedGoal.category,
        createdAt: savedGoal.createdAt,
        updatedAt: savedGoal.updatedAt,
      };
    });
  }
}
