import { Transaction } from "../../entities/transaction.entity";
import { FilterTransactionsQuery } from "../in/list-transactions.port";

export interface TransactionRepositoryPort {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction, entityManager?: any): Promise<void>;
  delete(id: string, entityManager?: any): Promise<void>;
  findAll(
    userId: string,
    query: FilterTransactionsQuery,
  ): Promise<{ data: Transaction[]; total: number }>;
  findAllWithoutPagination(
    userId: string,
    query: Omit<FilterTransactionsQuery, "page" | "limit">,
  ): Promise<Transaction[]>;
  getSummaryMetrics(
    userId: string,
    query: Omit<FilterTransactionsQuery, "page" | "limit">,
  ): Promise<{ totalIncomes: number; totalExpenses: number }>;
  getMonthlyCashFlow(
    userId: string,
    year: number,
  ): Promise<{ month: string; income: number; expense: number }[]>;
  getCategoryDistribution(
    userId: string,
    month: number,
    year: number,
  ): Promise<{ categoryId: string; name: string; amount: number }[]>;
}
