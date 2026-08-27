import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import type {
  PayInvoicePort,
  PayInvoiceCommand,
} from "@domain/ports/in/pay-invoice.port";
import type { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import type { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import type { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import type { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import { Transaction } from "@domain/entities/transaction.entity";

export class PayInvoiceUseCase implements PayInvoicePort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cardRepository: CreditCardRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly invoiceRepository: InvoiceRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(userId: string, cmd: PayInvoiceCommand): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // 1. Get Credit Card
      const card = await this.cardRepository.findById(
        cmd.creditCardId,
        manager,
      );
      if (!card) {
        throw new Error("Cartão de crédito não encontrado.");
      }
      if (card.userId !== userId) {
        throw new Error("Acesso negado.");
      }

      // 2. Get Invoice for month and year
      const invoice = await this.invoiceRepository.findCurrentInvoice(
        cmd.creditCardId,
        cmd.month,
        cmd.year,
        manager,
      );
      if (!invoice) {
        throw new Error("Fatura não encontrada.");
      }
      if (invoice.status === "PAID") {
        throw new Error("Fatura já está paga.");
      }

      // 3. Get Source Account
      const account = await this.accountRepository.findById(
        cmd.sourceAccountId,
        manager,
      );
      if (!account) {
        throw new Error("Conta bancária não encontrada.");
      }
      if (account.userId !== userId) {
        throw new Error("Acesso negado à conta bancária.");
      }

      const amountToPay = Number(invoice.totalAmount);
      if (amountToPay <= 0) {
        throw new Error("O valor da fatura deve ser maior que zero.");
      }

      // 4. Validate Account balance
      if (Number(account.balance) < amountToPay) {
        throw new Error("Saldo insuficiente para pagar a fatura.");
      }

      // 5. Debit source account balance
      account.balance = Number(account.balance) - amountToPay;
      await this.accountRepository.save(account, manager);

      // 6. Mark invoice as paid
      invoice.status = "PAID";
      await this.invoiceRepository.save(invoice, manager);

      // 7. Restore card limit
      card.availableLimit = Number(card.availableLimit) + amountToPay;
      if (card.availableLimit > card.creditLimit) {
        card.availableLimit = card.creditLimit;
      }
      await this.cardRepository.save(card, manager);

      // 8. Generate a transaction of type EXPENSE in statement
      const transaction = new Transaction({
        id: randomUUID(),
        userId,
        accountId: cmd.sourceAccountId,
        categoryId: null,
        destinationAccountId: null,
        description: `PAGAMENTO FATURA - ${String(cmd.month).padStart(2, "0")}/${cmd.year} - ${card.cardName}`,
        amount: amountToPay,
        type: "EXPENSE",
        status: "SETTLED",
        date: new Date().toISOString().split("T")[0] as string,
        tags: ["fatura", "cartao"],
        encryptedDetails: null,
        paymentMethod: "ACCOUNT",
      });
      await this.transactionRepository.save(transaction, manager);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
