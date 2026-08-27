import { CreditCard } from "../../entities/credit-card.entity";

export interface CreateCreditCardInput {
  userId: string;
  accountId: string;
  cardName: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  maskedDigits: string;
  encryptedPayload: {
    encryptedData: string;
    iv: string;
    authTag: string;
  };
}

export interface ManageCreditCardPort {
  createCreditCard(input: CreateCreditCardInput): Promise<CreditCard>;
  listCreditCards(userId: string): Promise<CreditCard[]>;
  adjustLimit(
    userId: string,
    cardId: string,
    newLimit: number,
  ): Promise<CreditCard>;
  payInvoice(
    userId: string,
    cardId: string,
    month: number,
    year: number,
  ): Promise<void>;
}
