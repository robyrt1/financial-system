import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import type {
  ManageTransactionPort,
  CreateTransactionCommand,
  UpdateTransactionCommand,
  BulkTransactionActionCommand,
} from "@domain/ports/in/manage-transaction.port";
import type { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import type { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import type { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import type { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { Transaction } from "@domain/entities/transaction.entity";
import { Invoice } from "@domain/entities/invoice.entity";

export class ManageTransactionUseCase implements ManageTransactionPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
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

  async create(
    userId: string,
    cmd: CreateTransactionCommand,
  ): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      const paymentMethod = cmd.paymentMethod || "ACCOUNT";

      if (paymentMethod === "CREDIT_CARD") {
        if (cmd.type !== "EXPENSE") {
          throw new Error(
            "Apenas despesas são permitidas em transações de cartão de crédito.",
          );
        }
        if (!cmd.creditCardId) {
          throw new Error("ID do cartão de crédito é obrigatório.");
        }
        const card = await this.cardRepository.findById(
          cmd.creditCardId,
          manager,
        );
        if (!card || card.userId !== userId) {
          throw new Error("Cartão de crédito não encontrado.");
        }

        if (Number(card.availableLimit) < Number(cmd.amount)) {
          throw new Error("Limite de crédito insuficiente.");
        }

        // Decrement card limit
        card.availableLimit = Number(card.availableLimit) - Number(cmd.amount);
        await this.cardRepository.save(card, manager);

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
            manager,
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
              throw new Error(
                "Não é possível adicionar transações em uma fatura já paga.",
              );
            }
            invoice.totalAmount = Number(invoice.totalAmount) + instAmount;
          }
          await this.invoiceRepository.save(invoice, manager);
        }

        const transactionId = randomUUID();
        const transaction = new Transaction({
          id: transactionId,
          userId,
          accountId: card.accountId, // Bind card's underlying account
          categoryId: cmd.categoryId || null,
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

        await this.transactionRepository.save(transaction, manager);
        return transaction;
      } else {
        // ACCOUNT paymentMethod path
        if (!cmd.accountId) {
          throw new Error("Conta bancária é obrigatória.");
        }
        const account = await this.accountRepository.findById(
          cmd.accountId,
          manager,
        );
        if (!account || account.userId !== userId) {
          throw new Error(
            "Conta de origem não encontrada ou inválida para o usuário.",
          );
        }

        let destAccount: any = null;
        if (cmd.type === "TRANSFER") {
          if (!cmd.destinationAccountId) {
            throw new Error(
              "Conta de destino é obrigatória para transferências.",
            );
          }
          destAccount = await this.accountRepository.findById(
            cmd.destinationAccountId,
            manager,
          );
          if (!destAccount) {
            throw new Error("Conta de destino não encontrada.");
          }
        }

        if (cmd.status === "SETTLED") {
          if (cmd.type === "INCOME") {
            account.balance = Number(account.balance) + Number(cmd.amount);
          } else if (cmd.type === "EXPENSE") {
            account.balance = Number(account.balance) - Number(cmd.amount);
          } else if (cmd.type === "TRANSFER" && destAccount) {
            account.balance = Number(account.balance) - Number(cmd.amount);
            destAccount.balance =
              Number(destAccount.balance) + Number(cmd.amount);
          }
        }

        const transactionId = randomUUID();
        const transaction = new Transaction({
          id: transactionId,
          userId,
          accountId: cmd.accountId,
          categoryId: cmd.categoryId || null,
          destinationAccountId: cmd.destinationAccountId || null,
          description: cmd.description,
          amount: cmd.amount,
          type: cmd.type,
          status: cmd.status,
          date: cmd.date,
          tags: cmd.tags || [],
          encryptedDetails: cmd.encryptedDetails || null,
          paymentMethod: "ACCOUNT",
          creditCardId: null,
          installments: 1,
        });

        await this.accountRepository.save(account, manager);
        if (destAccount) {
          await this.accountRepository.save(destAccount, manager);
        }

        await this.transactionRepository.save(transaction, manager);
        return transaction;
      }
    });
  }

  async update(
    userId: string,
    id: string,
    cmd: UpdateTransactionCommand,
  ): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction || transaction.userId !== userId) {
        throw new Error("Transação não encontrada.");
      }

      // 1. Revert previous effects
      if (transaction.paymentMethod === "CREDIT_CARD") {
        if (transaction.creditCardId) {
          const card = await this.cardRepository.findById(
            transaction.creditCardId,
            manager,
          );
          if (card) {
            card.availableLimit =
              Number(card.availableLimit) + Number(transaction.amount);
            await this.cardRepository.save(card, manager);

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
                manager,
              );
              if (invoice) {
                if (invoice.status === "PAID") {
                  throw new Error(
                    "Não é possível alterar transações de uma fatura já paga.",
                  );
                }
                invoice.totalAmount = Number(invoice.totalAmount) - instAmount;
                await this.invoiceRepository.save(invoice, manager);
              }
            }
          }
        }
      } else {
        // ACCOUNT path
        if (transaction.status === "SETTLED") {
          const oldAccount = await this.accountRepository.findById(
            transaction.accountId,
            manager,
          );
          if (oldAccount) {
            if (transaction.type === "INCOME") {
              oldAccount.balance =
                Number(oldAccount.balance) - Number(transaction.amount);
            } else if (transaction.type === "EXPENSE") {
              oldAccount.balance =
                Number(oldAccount.balance) + Number(transaction.amount);
            } else if (
              transaction.type === "TRANSFER" &&
              transaction.destinationAccountId
            ) {
              oldAccount.balance =
                Number(oldAccount.balance) + Number(transaction.amount);
              const oldDestAccount = await this.accountRepository.findById(
                transaction.destinationAccountId,
                manager,
              );
              if (oldDestAccount) {
                oldDestAccount.balance =
                  Number(oldDestAccount.balance) - Number(transaction.amount);
                await this.accountRepository.save(oldDestAccount, manager);
              }
            }
            await this.accountRepository.save(oldAccount, manager);
          }
        }
      }

      // 2. Apply new parameters
      const updatedPaymentMethod =
        cmd.paymentMethod ?? transaction.paymentMethod;
      const updatedAccountId = cmd.accountId ?? transaction.accountId;
      const updatedAmount = cmd.amount ?? transaction.amount;
      const updatedType = cmd.type ?? transaction.type;
      const updatedStatus = cmd.status ?? transaction.status;
      const updatedCategoryId =
        cmd.categoryId !== undefined ? cmd.categoryId : transaction.categoryId;
      const updatedDestinationAccountId =
        cmd.destinationAccountId !== undefined
          ? cmd.destinationAccountId
          : transaction.destinationAccountId;
      const updatedDescription = cmd.description ?? transaction.description;
      const updatedDate = cmd.date ?? transaction.date;
      const updatedTags = cmd.tags ?? transaction.tags;
      const updatedEncDetails =
        cmd.encryptedDetails !== undefined
          ? cmd.encryptedDetails
          : transaction.encryptedDetails;
      const updatedCreditCardId = cmd.creditCardId ?? transaction.creditCardId;
      const updatedInstallments = cmd.installments ?? transaction.installments;

      // 3. Apply new effects
      if (updatedPaymentMethod === "CREDIT_CARD") {
        if (updatedType !== "EXPENSE") {
          throw new Error(
            "Apenas despesas são permitidas em transações de cartão de crédito.",
          );
        }
        if (!updatedCreditCardId) {
          throw new Error("ID do cartão de crédito é obrigatório.");
        }
        const card = await this.cardRepository.findById(
          updatedCreditCardId,
          manager,
        );
        if (!card || card.userId !== userId) {
          throw new Error("Cartão de crédito não encontrado.");
        }

        if (Number(card.availableLimit) < Number(updatedAmount)) {
          throw new Error("Limite de crédito insuficiente.");
        }

        // Decrement card limit
        card.availableLimit =
          Number(card.availableLimit) - Number(updatedAmount);
        await this.cardRepository.save(card, manager);

        // Upsert installments
        for (let i = 0; i < updatedInstallments; i++) {
          const { month, year } = this.getBillingPeriod(
            updatedDate,
            card.closingDay,
            i,
          );
          const instAmount = this.calculateInstallmentCents(
            Number(updatedAmount),
            updatedInstallments,
            i,
          );

          let invoice = await this.invoiceRepository.findCurrentInvoice(
            card.id,
            month,
            year,
            manager,
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
              throw new Error(
                "Não é possível adicionar transações em uma fatura já paga.",
              );
            }
            invoice.totalAmount = Number(invoice.totalAmount) + instAmount;
          }
          await this.invoiceRepository.save(invoice, manager);
        }

        const updatedTransaction = new Transaction({
          id: transaction.id,
          userId,
          accountId: card.accountId,
          categoryId: updatedCategoryId,
          destinationAccountId: null,
          description: updatedDescription,
          amount: updatedAmount,
          type: updatedType,
          status: updatedStatus,
          date: updatedDate,
          tags: updatedTags,
          encryptedDetails: updatedEncDetails,
          paymentMethod: "CREDIT_CARD",
          creditCardId: card.id,
          installments: updatedInstallments,
          createdAt: transaction.createdAt,
        });

        await this.transactionRepository.save(updatedTransaction, manager);
        return updatedTransaction;
      } else {
        // ACCOUNT path
        const account = await this.accountRepository.findById(
          updatedAccountId,
          manager,
        );
        if (!account || account.userId !== userId) {
          throw new Error("Conta não encontrada.");
        }

        let destAccount: any = null;
        if (updatedType === "TRANSFER") {
          if (!updatedDestinationAccountId) {
            throw new Error(
              "Conta de destino é obrigatória para transferências.",
            );
          }
          destAccount = await this.accountRepository.findById(
            updatedDestinationAccountId,
            manager,
          );
          if (!destAccount) {
            throw new Error("Conta de destino não encontrada.");
          }
        }

        if (updatedStatus === "SETTLED") {
          if (updatedType === "INCOME") {
            account.balance = Number(account.balance) + Number(updatedAmount);
          } else if (updatedType === "EXPENSE") {
            account.balance = Number(account.balance) - Number(updatedAmount);
          } else if (updatedType === "TRANSFER" && destAccount) {
            account.balance = Number(account.balance) - Number(updatedAmount);
            destAccount.balance =
              Number(destAccount.balance) + Number(updatedAmount);
          }
        }

        const updatedTransaction = new Transaction({
          id: transaction.id,
          userId,
          accountId: updatedAccountId,
          categoryId: updatedCategoryId,
          destinationAccountId: updatedDestinationAccountId,
          description: updatedDescription,
          amount: updatedAmount,
          type: updatedType,
          status: updatedStatus,
          date: updatedDate,
          tags: updatedTags,
          encryptedDetails: updatedEncDetails,
          paymentMethod: "ACCOUNT",
          creditCardId: null,
          installments: 1,
          createdAt: transaction.createdAt,
        });

        await this.accountRepository.save(account, manager);
        if (destAccount) {
          await this.accountRepository.save(destAccount, manager);
        }

        await this.transactionRepository.save(updatedTransaction, manager);
        return updatedTransaction;
      }
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction || transaction.userId !== userId) {
        throw new Error("Transação não encontrada.");
      }

      if (transaction.paymentMethod === "CREDIT_CARD") {
        if (transaction.creditCardId) {
          const card = await this.cardRepository.findById(
            transaction.creditCardId,
            manager,
          );
          if (card) {
            card.availableLimit =
              Number(card.availableLimit) + Number(transaction.amount);
            await this.cardRepository.save(card, manager);

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
                manager,
              );
              if (invoice) {
                if (invoice.status === "PAID") {
                  throw new Error(
                    "Não é possível excluir transações de uma fatura já paga.",
                  );
                }
                invoice.totalAmount = Number(invoice.totalAmount) - instAmount;
                await this.invoiceRepository.save(invoice, manager);
              }
            }
          }
        }
      } else {
        // ACCOUNT path
        if (transaction.status === "SETTLED") {
          const account = await this.accountRepository.findById(
            transaction.accountId,
            manager,
          );
          if (account) {
            if (transaction.type === "INCOME") {
              account.balance =
                Number(account.balance) - Number(transaction.amount);
            } else if (transaction.type === "EXPENSE") {
              account.balance =
                Number(account.balance) + Number(transaction.amount);
            } else if (
              transaction.type === "TRANSFER" &&
              transaction.destinationAccountId
            ) {
              account.balance =
                Number(account.balance) + Number(transaction.amount);
              const destAccount = await this.accountRepository.findById(
                transaction.destinationAccountId,
                manager,
              );
              if (destAccount) {
                destAccount.balance =
                  Number(destAccount.balance) - Number(transaction.amount);
                await this.accountRepository.save(destAccount, manager);
              }
            }
            await this.accountRepository.save(account, manager);
          }
        }
      }

      await this.transactionRepository.delete(id, manager);
    });
  }

  async bulkAction(
    userId: string,
    cmd: BulkTransactionActionCommand,
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      for (const id of cmd.transactionIds) {
        if (cmd.action === "SETTLE") {
          const transaction = await this.transactionRepository.findById(id);
          if (
            transaction &&
            transaction.userId === userId &&
            transaction.status !== "SETTLED"
          ) {
            if (transaction.paymentMethod === "CREDIT_CARD") {
              // Credit card transactions are settled immediately in limit/invoice
              transaction.settle();
              await this.transactionRepository.save(transaction, manager);
            } else {
              const account = await this.accountRepository.findById(
                transaction.accountId,
                manager,
              );
              if (account) {
                let destAccount: any = null;
                if (
                  transaction.type === "TRANSFER" &&
                  transaction.destinationAccountId
                ) {
                  destAccount = await this.accountRepository.findById(
                    transaction.destinationAccountId,
                    manager,
                  );
                }

                if (transaction.type === "INCOME") {
                  account.balance =
                    Number(account.balance) + Number(transaction.amount);
                } else if (transaction.type === "EXPENSE") {
                  account.balance =
                    Number(account.balance) - Number(transaction.amount);
                } else if (transaction.type === "TRANSFER" && destAccount) {
                  account.balance =
                    Number(account.balance) - Number(transaction.amount);
                  destAccount.balance =
                    Number(destAccount.balance) + Number(transaction.amount);
                  await this.accountRepository.save(destAccount, manager);
                }

                transaction.settle();
                await this.accountRepository.save(account, manager);
                await this.transactionRepository.save(transaction, manager);
              }
            }
          }
        } else if (cmd.action === "DELETE") {
          await this.delete(userId, id);
        }
      }
    });
  }
}
