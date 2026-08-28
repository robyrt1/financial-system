import { randomUUID } from "crypto";
import {
  CreateGoalPort,
  DepositGoalPort,
} from "../../../domain/ports/in/goal-in.ports";
import { GoalRepositoryPort } from "../../../domain/ports/out/goal-repository.port";
import { CreateGoalDto, GoalItemResponseDto } from "../../dtos/goal.dtos";
import { Goal } from "../../../domain/entities/goal.entity";

export class CreateGoalUseCase implements CreateGoalPort {
  constructor(
    private readonly goalRepository: GoalRepositoryPort,
    private readonly depositGoalUseCase?: DepositGoalPort,
  ) {}

  async execute(
    userId: string,
    data: CreateGoalDto,
  ): Promise<GoalItemResponseDto> {
    const goal = new Goal({
      id: randomUUID(),
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      deadline: data.deadline,
      category: data.category,
      icon: data.icon,
      color: data.color,
      status: "IN_PROGRESS",
    });

    await this.goalRepository.save(goal);

    if (
      data.initialAmount &&
      data.initialAmount > 0 &&
      data.sourceAccountId &&
      this.depositGoalUseCase
    ) {
      try {
        await this.depositGoalUseCase.execute(userId, goal.id, {
          amount: data.initialAmount,
          sourceAccountId: data.sourceAccountId,
          date: new Date().toISOString().split("T")[0],
        });
      } catch (err) {
        // Se falhar o deposito inicial, podemos deletar a meta ou deixar ela criada com saldo 0
        // Para garantir que não tenhamos metas vazias não intencionais:
        await this.goalRepository.delete(goal.id);
        throw err; // Repassa o erro (ex: InsufficientFunds)
      }
    }

    // Busca atualizada se houve deposito
    const updatedGoal = await this.goalRepository.findById(goal.id);
    const finalGoal = updatedGoal || goal;

    return {
      id: finalGoal.id,
      name: finalGoal.name,
      targetAmount: finalGoal.targetAmount,
      currentAmount: finalGoal.currentAmount,
      deadline: finalGoal.deadline,
      monthsRemaining: 1, // simplified for creation return
      percentage: (finalGoal.currentAmount / finalGoal.targetAmount) * 100,
      suggestedMonthlyDeposit: 0,
      icon: finalGoal.icon,
      color: finalGoal.color,
      status: finalGoal.status,
      category: finalGoal.category,
      createdAt: finalGoal.createdAt,
      updatedAt: finalGoal.updatedAt,
    };
  }
}
