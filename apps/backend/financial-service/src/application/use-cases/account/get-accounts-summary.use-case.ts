import {
  GetAccountsSummaryPort,
  AccountsSummary,
} from "@domain/ports/in/get-accounts-summary.port";
import { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";

export class GetAccountsSummaryUseCase implements GetAccountsSummaryPort {
  constructor(
    private readonly accountRepository: AccountRepositoryPort,
    private readonly creditCardRepository: CreditCardRepositoryPort,
    private readonly invoiceRepository: InvoiceRepositoryPort,
  ) {}

  async execute(userId: string): Promise<AccountsSummary> {
    // 1. Consolidated liquid balance from accounts
    const accounts = await this.accountRepository.findByUserId(userId);
    const consolidatedBalance = accounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0,
    );

    // 2. Available credit limit
    const cards = await this.creditCardRepository.findByUserId(userId);
    const availableCreditLimit = cards.reduce(
      (sum, card) => sum + Number(card.availableLimit),
      0,
    );

    // 3. Open invoices sum
    let openInvoicesAmount = 0;
    for (const card of cards) {
      const invoices = await this.invoiceRepository.findByCardId(card.id);
      const unpaidInvoices = invoices.filter((inv) => inv.status !== "PAID");
      openInvoicesAmount += unpaidInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount),
        0,
      );
    }

    return {
      consolidatedBalance,
      openInvoicesAmount,
      availableCreditLimit,
    };
  }
}
