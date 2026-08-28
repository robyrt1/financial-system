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

export interface DashboardMetricsResponse {
  kpis: DashboardKpis;
  cashFlow: MonthlyCashFlow[];
  categoryDistribution: CategoryDistribution[];
}

export interface GetDashboardMetricsPort {
  execute(userId: string): Promise<DashboardMetricsResponse>;
}
