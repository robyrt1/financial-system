export interface AccountsSummary {
  consolidatedBalance: number;
  openInvoicesAmount: number;
  availableCreditLimit: number;
}

export interface GetAccountsSummaryPort {
  execute(userId: string): Promise<AccountsSummary>;
}
