export interface MonthlyProjection {
  month: number;
  year: number;
  amount: number;
}

export interface GetInvoiceProjectionsPort {
  execute(userId: string): Promise<MonthlyProjection[]>;
}
