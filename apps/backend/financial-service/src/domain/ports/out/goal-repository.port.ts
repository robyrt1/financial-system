import { Goal } from "../../entities/goal.entity";
import { GoalContribution } from "../../entities/goal-contribution.entity";

export interface GoalRepositoryPort {
  save(goal: Goal, transactionManager?: any): Promise<Goal>;
  findById(id: string, transactionManager?: any): Promise<Goal | null>;
  findAllByUserId(userId: string, transactionManager?: any): Promise<Goal[]>;
  delete(id: string, transactionManager?: any): Promise<void>;
}

export interface GoalContributionRepositoryPort {
  save(
    contribution: GoalContribution,
    transactionManager?: any,
  ): Promise<GoalContribution>;
  findByGoalId(
    goalId: string,
    transactionManager?: any,
  ): Promise<GoalContribution[]>;
  deleteByGoalId(goalId: string, transactionManager?: any): Promise<void>;
}
