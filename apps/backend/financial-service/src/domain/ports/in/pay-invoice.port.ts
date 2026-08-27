export interface PayInvoiceCommand {
  creditCardId: string;
  month: number;
  year: number;
  sourceAccountId: string;
}

export interface PayInvoicePort {
  execute(userId: string, cmd: PayInvoiceCommand): Promise<void>;
}
