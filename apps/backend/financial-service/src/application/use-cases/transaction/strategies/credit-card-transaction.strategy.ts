import { Injectable } from "@nestjs/common";
import { TransactionStrategy } from "./transaction-strategy";
import { Transaction } from "@domain/entities/transaction.entity";
import { Invoice } from "@domain/entities/invoice.entity";
import { CreateTransactionCommand } from "@domain/ports/in/manage-transaction.port";
import { Notification } from "@domain/notification/notification";
import type { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import type { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { CreditCardNotFoundError } from "@domain/exceptions/credit-card-not-found.error";
import { InsufficientCreditLimitError } from "@domain/exceptions/insufficient-credit-limit.error";
import { PaidInvoiceModificationError } from "@domain/exceptions/paid-invoice-modification.error";
import { randomUUID } from "crypto";

@Injectable()
export class CreditCardTransactionStrategy implements TransactionStrategy {
  constructor(
    private readonly cardRepository: CreditCardRepositoryPort,
    private readonly invoiceRepository: InvoiceRepositoryPort,
  ) {}

  private calculateInstallmentCents(
    amount: number,
    installmentsCount: number,
    index: number,
  ): number {
    const baseAmount = Math.floor((amount / installmentsCount) * 100) / 100;
    const remainder = Number(
      (amount - baseAmount * installmentsCount).toFixed(2),
    );
    return index === 0 ? baseAmount + remainder : baseAmount;
  }

  private getBillingPeriod(dateStr: string, closingDay: number, index: number) {
    const [yStr, mStr, dStr] = (dateStr || "").split("-");
    const txYear = parseInt(yStr || "", 10);
    const txMonth = parseInt(mStr || "", 10);
    const txDay = parseInt(dStr || "", 10);

    let baseMonth = txMonth;
    let baseYear = txYear;

    if (txDay > closingDay) {
      baseMonth += 1;
    }

    let targetMonth = baseMonth + index;
    let targetYear = baseYear;

    while (targetMonth > 12) {
      targetMonth -= 12;
      targetYear += 1;
    }

    return { month: targetMonth, year: targetYear };
  }

  async validateCreation(
    cmd: CreateTransactionCommand,
    notification: Notification,
  ): Promise<void> {
    if (cmd.type !== "EXPENSE") {
      notification.addError({
        field: "type",
        message:
          "Apenas despesas são permitidas em transações de cartão de crédito.",
      });
    }
    if (!cmd.creditCardId) {
      notification.addError({
        field: "creditCardId",
        message: "ID do cartão de crédito é obrigatório.",
      });
    }
  }

  async processCreation(
    userId: string,
    cmd: CreateTransactionCommand,
  ): Promise<Transaction> {
    const card = await this.cardRepository.findById(cmd.creditCardId!);
    if (!card || card.userId !== userId) {
      throw new CreditCardNotFoundError(cmd.creditCardId!);
    }

    if (Number(card.availableLimit) < Number(cmd.amount)) {
      throw new InsufficientCreditLimitError(
        card.id,
        Number(cmd.amount),
        Number(card.availableLimit),
      );
    }

    // Decrement card limit
    card.availableLimit = Number(card.availableLimit) - Number(cmd.amount);
    await this.cardRepository.save(card);

    // Upsert installments into open invoices
    const installmentsCount = cmd.installments || 1;
    for (let i = 0; i < installmentsCount; i++) {
      const { month, year } = this.getBillingPeriod(
        cmd.date,
        card.closingDay,
        i,
      );
      const instAmount = this.calculateInstallmentCents(
        Number(cmd.amount),
        installmentsCount,
        i,
      );

      let invoice = await this.invoiceRepository.findCurrentInvoice(
        card.id,
        month,
        year,
      );
      if (!invoice) {
        invoice = new Invoice({
          id: randomUUID(),
          creditCardId: card.id,
          month,
          year,
          totalAmount: instAmount,
          status: "OPEN",
        });
      } else {
        if (invoice.status === "PAID") {
          throw new PaidInvoiceModificationError(
            "Não é possível adicionar transações em uma fatura já paga.",
          );
        }
        invoice.totalAmount = Number(invoice.totalAmount) + instAmount;
      }
      await this.invoiceRepository.save(invoice);
    }

    return new Transaction({
      id: randomUUID(),
      userId,
      accountId: card.accountId, // Bind card's underlying account
      categoryId: cmd.categoryId || null,
      subcategoryId: cmd.subcategoryId || null,
      destinationAccountId: null,
      description: cmd.description,
      amount: cmd.amount,
      type: cmd.type,
      status: cmd.status,
      date: cmd.date,
      tags: cmd.tags || [],
      encryptedDetails: cmd.encryptedDetails || null,
      paymentMethod: "CREDIT_CARD",
      creditCardId: card.id,
      installments: installmentsCount,
    });
  }

  async revertEffects(transaction: Transaction): Promise<void> {
    if (transaction.creditCardId) {
      const card = await this.cardRepository.findById(transaction.creditCardId);
      if (card) {
        card.availableLimit =
          Number(card.availableLimit) + Number(transaction.amount);
        await this.cardRepository.save(card);

        // Deduct installments
        for (let i = 0; i < transaction.installments; i++) {
          const { month, year } = this.getBillingPeriod(
            transaction.date,
            card.closingDay,
            i,
          );
          const instAmount = this.calculateInstallmentCents(
            Number(transaction.amount),
            transaction.installments,
            i,
          );

          const invoice = await this.invoiceRepository.findCurrentInvoice(
            card.id,
            month,
            year,
          );
          if (invoice) {
            if (invoice.status === "PAID") {
              throw new PaidInvoiceModificationError(
                "Não é possível alterar transações de uma fatura já paga.",
              );
            }
            invoice.totalAmount = Number(invoice.totalAmount) - instAmount;
            await this.invoiceRepository.save(invoice);
          }
        }
      }
    }
  }

  async applyEffects(transaction: Transaction): Promise<void> {
    if (transaction.creditCardId) {
      const card = await this.cardRepository.findById(transaction.creditCardId);
      if (!card) {
        throw new CreditCardNotFoundError(transaction.creditCardId);
      }

      if (Number(card.availableLimit) < Number(transaction.amount)) {
        throw new InsufficientCreditLimitError(
          card.id,
          Number(transaction.amount),
          Number(card.availableLimit),
        );
      }

      // Decrement card limit
      card.availableLimit =
        Number(card.availableLimit) - Number(transaction.amount);
      await this.cardRepository.save(card);

      // Upsert installments
      for (let i = 0; i < transaction.installments; i++) {
        const { month, year } = this.getBillingPeriod(
          transaction.date,
          card.closingDay,
          i,
        );
        const instAmount = this.calculateInstallmentCents(
          Number(transaction.amount),
          transaction.installments,
          i,
        );

        let invoice = await this.invoiceRepository.findCurrentInvoice(
          card.id,
          month,
          year,
        );
        if (!invoice) {
          invoice = new Invoice({
            id: randomUUID(),
            creditCardId: card.id,
            month,
            year,
            totalAmount: instAmount,
            status: "OPEN",
          });
        } else {
          if (invoice.status === "PAID") {
            throw new PaidInvoiceModificationError(
              "Não é possível adicionar transações em uma fatura já paga.",
            );
          }
          invoice.totalAmount = Number(invoice.totalAmount) + instAmount;
        }
        await this.invoiceRepository.save(invoice);
      }
    }
  }
}
