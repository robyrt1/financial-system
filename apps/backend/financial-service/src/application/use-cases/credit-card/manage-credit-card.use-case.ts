import { randomUUID } from "crypto";
import { CreditCard } from "@domain/entities/credit-card.entity";
import { Invoice } from "@domain/entities/invoice.entity";
import {
  ManageCreditCardPort,
  CreateCreditCardInput,
} from "@domain/ports/in/manage-credit-card.port";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { EventPublisherPort } from "@domain/ports/out/event-publisher.port";

export class ManageCreditCardUseCase implements ManageCreditCardPort {
  constructor(
    private readonly creditCardRepository: CreditCardRepositoryPort,
    private readonly invoiceRepository: InvoiceRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async createCreditCard(input: CreateCreditCardInput): Promise<CreditCard> {
    const account = await this.accountRepository.findById(input.accountId);
    if (!account || account.userId !== input.userId) {
      throw new Error("Associated bank account not found or access denied");
    }

    const card = new CreditCard({
      id: randomUUID(),
      userId: input.userId,
      accountId: input.accountId,
      cardName: input.cardName,
      maskedDigits: input.maskedDigits,
      creditLimit: input.creditLimit,
      availableLimit: input.creditLimit,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
      encryptedPayload: input.encryptedPayload,
    });

    await this.creditCardRepository.save(card);

    // Seed an initial open invoice for the current month
    const now = new Date();
    const initialInvoice = new Invoice({
      id: randomUUID(),
      creditCardId: card.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalAmount: 0,
      status: "OPEN",
    });
    await this.invoiceRepository.save(initialInvoice);

    return card;
  }

  async listCreditCards(userId: string): Promise<CreditCard[]> {
    return this.creditCardRepository.findByUserId(userId);
  }

  async adjustLimit(
    userId: string,
    cardId: string,
    newLimit: number,
  ): Promise<CreditCard> {
    const card = await this.creditCardRepository.findById(cardId);
    if (!card || card.userId !== userId) {
      throw new Error("Credit card not found or access denied");
    }

    card.adjustLimit(newLimit);
    await this.creditCardRepository.save(card);

    return card;
  }

  async payInvoice(
    userId: string,
    cardId: string,
    month: number,
    year: number,
  ): Promise<void> {
    const card = await this.creditCardRepository.findById(cardId);
    if (!card || card.userId !== userId) {
      throw new Error("Credit card not found or access denied");
    }

    const invoice = await this.invoiceRepository.findCurrentInvoice(
      cardId,
      month,
      year,
    );
    if (!invoice) {
      throw new Error("Invoice not found for specified month/year");
    }

    if (invoice.status === "PAID") {
      throw new Error("Invoice is already paid");
    }

    const paidAmount = Number(invoice.totalAmount);
    invoice.pay();
    await this.invoiceRepository.save(invoice);

    // Adjust card limits
    card.availableLimit = Math.min(
      card.creditLimit,
      card.availableLimit + paidAmount,
    );
    await this.creditCardRepository.save(card);

    // Publish events
    await this.eventPublisher.publish("invoice-paid", {
      cardId: card.id,
      userId: card.userId,
      month,
      year,
      amount: paidAmount,
    });
  }
}
