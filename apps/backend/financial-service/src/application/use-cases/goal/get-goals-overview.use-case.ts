import { GetGoalsOverviewPort } from "../../../domain/ports/in/goal-in.ports";
import { GoalRepositoryPort } from "../../../domain/ports/out/goal-repository.port";
import {
  GoalsOverviewResponseDto,
  GoalItemResponseDto,
} from "../../dtos/goal.dtos";

export class GetGoalsOverviewUseCase implements GetGoalsOverviewPort {
  constructor(private readonly goalRepository: GoalRepositoryPort) {}

  async execute(
    userId: string,
    status?: "ALL" | "IN_PROGRESS" | "COMPLETED" | "REDEEMED",
  ): Promise<GoalsOverviewResponseDto> {
    const goals = await this.goalRepository.findAllByUserId(userId);

    let filteredGoals = goals;
    if (status && status !== "ALL") {
      filteredGoals = goals.filter((g) => g.status === status);
    }

    let totalAccumulated = 0;
    let totalTarget = 0;
    let sumSuggestedDeposits = 0;

    const today = new Date();

    const formattedGoals: GoalItemResponseDto[] = filteredGoals.map((goal) => {
      const isPending = goal.status === "IN_PROGRESS";

      // Calculate months remaining
      const deadlineDate = new Date(goal.deadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      let diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));

      if (diffMonths < 1) {
        diffMonths = 1; // Minimum 1 month to avoid division by zero or negative months
      }

      let percentage = (goal.currentAmount / goal.targetAmount) * 100;
      if (percentage > 100) percentage = 100;

      let suggestedMonthlyDeposit = 0;
      if (isPending) {
        const remainingAmount = goal.targetAmount - goal.currentAmount;
        if (remainingAmount > 0) {
          suggestedMonthlyDeposit = Number(
            (remainingAmount / diffMonths).toFixed(2),
          );
        }
      }

      // Add to KPIs only if active (IN_PROGRESS or COMPLETED, ignore REDEEMED for totals maybe? The user didn't specify. Usually REDEEMED is closed. Let's include IN_PROGRESS and COMPLETED for totals).
      if (goal.status !== "REDEEMED") {
        totalAccumulated += goal.currentAmount;
        totalTarget += goal.targetAmount;
        sumSuggestedDeposits += suggestedMonthlyDeposit;
      }

      return {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        monthsRemaining: diffMonths,
        percentage: Number(percentage.toFixed(2)),
        suggestedMonthlyDeposit,
        icon: goal.icon,
        color: goal.color,
        status: goal.status,
        category: goal.category,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    });

    return {
      kpis: {
        totalAccumulated: Number(totalAccumulated.toFixed(2)),
        totalTarget: Number(totalTarget.toFixed(2)),
        averageRequiredMonthlyDeposit: Number(sumSuggestedDeposits.toFixed(2)),
      },
      goals: formattedGoals,
    };
  }
}
