import {
  ListTransactionsPort,
  FilterTransactionsQuery,
  TransactionsListResponse,
} from "@domain/ports/in/list-transactions.port";
import { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";

export class ListTransactionsUseCase implements ListTransactionsPort {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    userId: string,
    query: FilterTransactionsQuery,
  ): Promise<TransactionsListResponse> {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);

    const { data, total } = await this.transactionRepository.findAll(userId, {
      ...query,
      page,
      limit,
    });

    const metrics = await this.transactionRepository.getSummaryMetrics(
      userId,
      query,
    );
    const totalIncomes = Number(metrics.totalIncomes || 0);
    const totalExpenses = Number(metrics.totalExpenses || 0);
    const netBalance = totalIncomes - totalExpenses;

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
      summary: {
        totalIncomes,
        totalExpenses,
        netBalance,
      },
    };
  }
}
