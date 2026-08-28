import { GoalStatus } from "../../domain/entities/goal.entity";

export class GoalItemResponseDto {
  id!: string;
  name!: string;
  targetAmount!: number;
  currentAmount!: number;
  deadline!: string;
  monthsRemaining!: number;
  percentage!: number;
  suggestedMonthlyDeposit!: number;
  icon!: string | null;
  color!: string | null;
  status!: GoalStatus;
  category!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class GoalsOverviewResponseDto {
  kpis!: {
    totalAccumulated: number;
    totalTarget: number;
    averageRequiredMonthlyDeposit: number;
  };
  goals!: GoalItemResponseDto[];
}

export class CreateGoalDto {
  name!: string;
  targetAmount!: number;
  initialAmount?: number;
  deadline!: string;
  category?: string;
  icon?: string;
  color?: string;
  sourceAccountId?: string;
}

export class UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
  category?: string;
}

export class DepositGoalDto {
  amount!: number;
  sourceAccountId!: string;
  date?: string;
}

export class DeleteGoalDto {
  refundAccountId?: string;
}

export class RedeemGoalDto {
  destinationAccountId!: string;
}
