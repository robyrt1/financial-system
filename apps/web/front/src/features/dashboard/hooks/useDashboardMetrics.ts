import { useState, useEffect, useCallback } from "react";
import { api } from "../../../app/api";

export interface DashboardKpis {
  patrimony: number;
  totalIncomes: number;
  totalExpenses: number;
  totalDebts: number;
}

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryDistribution {
  categoryId: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface DashboardMetrics {
  kpis: DashboardKpis;
  cashFlow: MonthlyCashFlow[];
  categoryDistribution: CategoryDistribution[];
}

export function useDashboardMetrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DashboardMetrics>("/dashboard/metrics");
      console.log("METRICS", response.data);
      setMetrics(response.data);
    } catch (err: any) {
      console.error("Failed to fetch dashboard metrics:", err);
      setError(err.message || "Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    loading,
    error,
    metrics,
    refetch: fetchMetrics,
  };
}
