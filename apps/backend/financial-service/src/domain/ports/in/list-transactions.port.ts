import { Transaction } from "../../entities/transaction.entity";

export interface FilterTransactionsQuery {
  search?: string;
  type?: string;
  status?: string;
  accountId?: string;
  categoryId?: string;
  subcategoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionsListResponse {
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    totalIncomes: number;
    totalExpenses: number;
    netBalance: number;
  };
}

export interface ListTransactionsPort {
  execute(
    userId: string,
    query: FilterTransactionsQuery,
  ): Promise<TransactionsListResponse>;
}
