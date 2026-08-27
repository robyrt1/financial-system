import {
  GetInvoiceProjectionsPort,
  MonthlyProjection,
} from "@domain/ports/in/get-invoice-projections.port";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";

export class GetInvoiceProjectionsUseCase implements GetInvoiceProjectionsPort {
  constructor(
    private readonly creditCardRepository: CreditCardRepositoryPort,
    private readonly invoiceRepository: InvoiceRepositoryPort,
  ) {}

  async execute(userId: string): Promise<MonthlyProjection[]> {
    const cards = await this.creditCardRepository.findByUserId(userId);

    const projections: MonthlyProjection[] = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();

      projections.push({
        month,
        year,
        amount: 0,
      });
    }

    for (const card of cards) {
      const invoices = await this.invoiceRepository.findByCardId(card.id);
      for (const proj of projections) {
        const matchedInvoice = invoices.find(
          (inv) => inv.month === proj.month && inv.year === proj.year,
        );
        if (matchedInvoice) {
          proj.amount += Number(matchedInvoice.totalAmount);
        }
      }
    }

    return projections;
  }
}
