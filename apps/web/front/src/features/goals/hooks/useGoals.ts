import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  goalsApi,
  type CreateGoalDto,
  type DepositGoalDto,
  type RedeemGoalDto,
  type DeleteGoalDto,
} from "../api/goals.api";

export const GOALS_QUERY_KEY = ["goals"];

export function useGoalsOverview(status?: string) {
  return useQuery({
    queryKey: [...GOALS_QUERY_KEY, status],
    queryFn: () => goalsApi.getOverview(status),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalDto) => goalsApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });
}

export function useDepositGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepositGoalDto }) =>
      goalsApi.depositGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });
}

export function useRedeemGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RedeemGoalDto }) =>
      goalsApi.redeemGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: DeleteGoalDto }) =>
      goalsApi.deleteGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    },
  });
}
