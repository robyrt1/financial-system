import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { DepositGoalPort } from "../../../domain/ports/in/goal-in.ports";
import {
  GoalRepositoryPort,
  GoalContributionRepositoryPort,
} from "../../../domain/ports/out/goal-repository.port";
import { AccountRepositoryPort } from "../../../domain/ports/out/account-repository.port";
import { TransactionRepositoryPort } from "../../../domain/ports/out/transaction-repository.port";
import { DepositGoalDto, GoalItemResponseDto } from "../../dtos/goal.dtos";
import {
  GoalNotFoundException,
  InsufficientFundsException,
} from "../../../domain/exceptions/goal.exceptions";
import { GoalContribution } from "../../../domain/entities/goal-contribution.entity";
import { Transaction } from "../../../domain/entities/transaction.entity";

export class DepositGoalUseCase implements DepositGoalPort {
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
    data: DepositGoalDto,
  ): Promise<GoalItemResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const goal = await this.goalRepository.findById(goalId, manager);
      if (!goal || goal.userId !== userId) {
        throw new GoalNotFoundException(goalId);
      }

      const account = await this.accountRepository.findById(
        data.sourceAccountId,
        manager,
      );
      if (!account || account.userId !== userId) {
        throw new Error("Conta de origem não encontrada.");
      }

      if (Number(account.balance) < data.amount) {
        throw new InsufficientFundsException();
      }

      // 1. Deduzir o saldo
      account.balance = Number(account.balance) - data.amount;
      await this.accountRepository.save(account, manager);

      // 2. Registrar transação de despesa (com tag da meta)
      const transactionId = randomUUID();
      const transaction = new Transaction({
        id: transactionId,
        userId,
        accountId: account.id,
        categoryId: null, // Conforme alinhado
        destinationAccountId: null,
        description: `Aporte na meta: ${goal.name}`,
        amount: data.amount,
        type: "EXPENSE",
        status: "SETTLED",
        date: data.date || new Date().toISOString().substring(0, 10),
        tags: ["Meta", goal.name],
        paymentMethod: "ACCOUNT",
        installments: 1,
        encryptedDetails: null,
      });
      await this.transactionRepository.save(transaction, manager);

      // 3. Atualizar a meta
      goal.deposit(data.amount);
      const savedGoal = await this.goalRepository.save(goal, manager);

      // 4. Registrar contribuição
      const contribution = new GoalContribution({
        id: randomUUID(),
        goalId: goal.id,
        userId,
        sourceAccountId: account.id,
        amount: data.amount,
        date: data.date || new Date().toISOString().substring(0, 10),
      });
      await this.contributionRepository.save(contribution, manager);

      // Calcular KPI pra retorno simplificado
      const today = new Date();
      const deadlineDate = new Date(savedGoal.deadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      let diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      if (diffMonths < 1) diffMonths = 1;

      let percentage = (savedGoal.currentAmount / savedGoal.targetAmount) * 100;
      if (percentage > 100) percentage = 100;

      let suggestedMonthlyDeposit = 0;
      if (savedGoal.status === "IN_PROGRESS") {
        const remaining = savedGoal.targetAmount - savedGoal.currentAmount;
        if (remaining > 0)
          suggestedMonthlyDeposit = Number((remaining / diffMonths).toFixed(2));
      }

      return {
        id: savedGoal.id,
        name: savedGoal.name,
        targetAmount: savedGoal.targetAmount,
        currentAmount: savedGoal.currentAmount,
        deadline: savedGoal.deadline,
        monthsRemaining: diffMonths,
        percentage: Number(percentage.toFixed(2)),
        suggestedMonthlyDeposit,
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
