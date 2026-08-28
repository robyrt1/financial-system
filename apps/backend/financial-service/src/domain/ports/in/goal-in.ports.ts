import {
  CreateGoalDto,
  DepositGoalDto,
  UpdateGoalDto,
  DeleteGoalDto,
  RedeemGoalDto,
  GoalsOverviewResponseDto,
  GoalItemResponseDto,
} from "../../../application/dtos/goal.dtos";

export interface GetGoalsOverviewPort {
  execute(
    userId: string,
    status?: "ALL" | "IN_PROGRESS" | "COMPLETED" | "REDEEMED",
  ): Promise<GoalsOverviewResponseDto>;
}

export interface CreateGoalPort {
  execute(userId: string, data: CreateGoalDto): Promise<GoalItemResponseDto>;
}

export interface UpdateGoalPort {
  execute(
    userId: string,
    goalId: string,
    data: UpdateGoalDto,
  ): Promise<GoalItemResponseDto>;
}

export interface DepositGoalPort {
  execute(
    userId: string,
    goalId: string,
    data: DepositGoalDto,
  ): Promise<GoalItemResponseDto>;
}

export interface DeleteGoalPort {
  execute(userId: string, goalId: string, data?: DeleteGoalDto): Promise<void>;
}

export interface RedeemGoalPort {
  execute(
    userId: string,
    goalId: string,
    data: RedeemGoalDto,
  ): Promise<GoalItemResponseDto>;
}
