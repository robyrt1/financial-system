import { api } from "../../../app/api";

export interface GoalKpis {
  totalAccumulated: number;
  totalTarget: number;
  averageRequiredMonthlyDeposit: number;
}

export interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthsRemaining: number;
  percentage: number;
  suggestedMonthlyDeposit: number;
  icon: string | null;
  color: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "REDEEMED";
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsOverviewResponse {
  kpis: GoalKpis;
  goals: GoalItem[];
}

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  deadline: string;
  category?: string;
  icon?: string;
  color?: string;
}

export interface DepositGoalDto {
  amount: number;
  sourceAccountId: string;
}

export interface RedeemGoalDto {
  destinationAccountId: string;
}

export interface DeleteGoalDto {
  refundAccountId?: string;
}

export const goalsApi = {
  getOverview: async (status?: string): Promise<GoalsOverviewResponse> => {
    const params = status && status !== "ALL" ? { status } : {};
    const response = await api.get<GoalsOverviewResponse>("/goals", { params });
    return response.data;
  },

  createGoal: async (data: CreateGoalDto): Promise<GoalItem> => {
    const response = await api.post<GoalItem>("/goals", data);
    return response.data;
  },

  depositGoal: async (id: string, data: DepositGoalDto): Promise<GoalItem> => {
    const response = await api.post<GoalItem>(`/goals/${id}/deposit`, data);
    return response.data;
  },

  redeemGoal: async (id: string, data: RedeemGoalDto): Promise<GoalItem> => {
    const response = await api.post<GoalItem>(`/goals/${id}/redeem`, data);
    return response.data;
  },

  deleteGoal: async (
    id: string,
    data?: DeleteGoalDto,
  ): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/goals/${id}`, {
      data,
    });
    return response.data;
  },
};
