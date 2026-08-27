import { Invoice } from "../../entities/invoice.entity";

export interface InvoiceRepositoryPort {
  findById(id: string, entityManager?: any): Promise<Invoice | null>;
  findByCardId(cardId: string): Promise<Invoice[]>;
  findCurrentInvoice(
    cardId: string,
    month: number,
    year: number,
    entityManager?: any,
  ): Promise<Invoice | null>;
  save(invoice: Invoice, entityManager?: any): Promise<void>;
}
