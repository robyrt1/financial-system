import { UpdateGoalPort } from "../../../domain/ports/in/goal-in.ports";
import { GoalRepositoryPort } from "../../../domain/ports/out/goal-repository.port";
import { UpdateGoalDto, GoalItemResponseDto } from "../../dtos/goal.dtos";
import { GoalNotFoundException } from "../../../domain/exceptions/goal.exceptions";

export class UpdateGoalUseCase implements UpdateGoalPort {
  constructor(private readonly goalRepository: GoalRepositoryPort) {}

  async execute(
    userId: string,
    goalId: string,
    data: UpdateGoalDto,
  ): Promise<GoalItemResponseDto> {
    const goal = await this.goalRepository.findById(goalId);
    if (!goal || goal.userId !== userId) {
      throw new GoalNotFoundException(goalId);
    }

    goal.updateDetails(data);
    const updatedGoal = await this.goalRepository.save(goal);

    const today = new Date();
    const deadlineDate = new Date(updatedGoal.deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    let diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    if (diffMonths < 1) diffMonths = 1;

    let percentage =
      (updatedGoal.currentAmount / updatedGoal.targetAmount) * 100;
    if (percentage > 100) percentage = 100;

    let suggestedMonthlyDeposit = 0;
    if (updatedGoal.status === "IN_PROGRESS") {
      const remaining = updatedGoal.targetAmount - updatedGoal.currentAmount;
      if (remaining > 0)
        suggestedMonthlyDeposit = Number((remaining / diffMonths).toFixed(2));
    }

    return {
      id: updatedGoal.id,
      name: updatedGoal.name,
      targetAmount: updatedGoal.targetAmount,
      currentAmount: updatedGoal.currentAmount,
      deadline: updatedGoal.deadline,
      monthsRemaining: diffMonths,
      percentage: Number(percentage.toFixed(2)),
      suggestedMonthlyDeposit,
      icon: updatedGoal.icon,
      color: updatedGoal.color,
      status: updatedGoal.status,
      category: updatedGoal.category,
      createdAt: updatedGoal.createdAt,
      updatedAt: updatedGoal.updatedAt,
    };
  }
}
