import { Injectable, Inject } from "@nestjs/common";
import { FINANCIAL_DI_TOKENS } from "../../infrastructure/di/tokens";
import * as getAccountsSummaryPort from "../../domain/ports/in/get-accounts-summary.port";
import * as transactionRepositoryPort from "../../domain/ports/out/transaction-repository.port";
import {
  GetDashboardMetricsPort,
  DashboardMetricsResponse,
} from "../../domain/ports/in/get-dashboard-metrics.port";

@Injectable()
export class GetDashboardMetricsUseCase implements GetDashboardMetricsPort {
  constructor(
    @Inject(FINANCIAL_DI_TOKENS.GET_ACCOUNTS_SUMMARY_PORT)
    private readonly getAccountsSummaryPort: getAccountsSummaryPort.GetAccountsSummaryPort,
    @Inject(FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepositoryPort: transactionRepositoryPort.TransactionRepositoryPort,
  ) {}

  async execute(userId: string): Promise<DashboardMetricsResponse> {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const firstDayOfMonth = new Date(
      currentYear,
      currentMonth - 1,
      1,
    ).toISOString();
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).toISOString();

    // 1. Get Accounts Summary (Patrimony and Debts)
    const summary = await this.getAccountsSummaryPort.execute(userId);

    // 2. Get Transaction Metrics for current month (Income/Expense Totals)
    const currentMonthMetrics =
      await this.transactionRepositoryPort.getSummaryMetrics(userId, {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth,
        status: "SETTLED",
      });

    // 3. Get Cash Flow for the year
    const rawCashFlow = await this.transactionRepositoryPort.getMonthlyCashFlow(
      userId,
      currentYear,
    );

    // Map month numbers to strings
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const cashFlow = rawCashFlow.map((c) => ({
      month: monthNames[parseInt(c.month, 10) - 1] || c.month,
      income: c.income,
      expense: c.expense,
    }));

    // 4. Get Category Distribution for current month
    const rawCategories =
      await this.transactionRepositoryPort.getCategoryDistribution(
        userId,
        currentMonth,
        currentYear,
      );

    const totalExpenses = rawCategories.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    const categoryDistribution = rawCategories.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      amount: c.amount,
      percentage:
        totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
    }));

    return {
      kpis: {
        patrimony: summary.consolidatedBalance,
        totalIncomes: currentMonthMetrics.totalIncomes,
        totalExpenses: currentMonthMetrics.totalExpenses,
        totalDebts: summary.openInvoicesAmount,
      },
      cashFlow,
      categoryDistribution,
    };
  }
}
