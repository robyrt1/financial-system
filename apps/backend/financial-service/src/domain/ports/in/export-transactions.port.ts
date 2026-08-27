export interface ExportTransactionsPort {
  execute(
    userId: string,
    format: "csv" | "ofx",
    filterQuery: {
      search?: string;
      type?: string;
      status?: string;
      accountId?: string;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ data: string; filename: string }>;
}
