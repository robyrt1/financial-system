import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { FINANCIAL_DI_TOKENS } from "./tokens";
import { TypeOrmAccountRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-account.repository";
import { TypeOrmCreditCardRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-credit-card.repository";
import { TypeOrmInvoiceRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-invoice.repository";
import { RabbitMqPublisherAdapter } from "../adapters/out/messaging/rabbitmq-publisher.adapter";
import { CryptoHelper } from "../adapters/out/security/crypto";

import { GetAccountsSummaryUseCase } from "@application/use-cases/account/get-accounts-summary.use-case";
import { ManageAccountUseCase } from "@application/use-cases/account/manage-account.use-case";
import { ManageCreditCardUseCase } from "@application/use-cases/credit-card/manage-credit-card.use-case";
import { GetInvoiceProjectionsUseCase } from "@application/use-cases/invoice/get-invoice-projections.use-case";
import { ListTransactionsUseCase } from "@application/use-cases/transaction/list-transactions.use-case";
import { ManageTransactionUseCase } from "@application/use-cases/transaction/manage-transaction.use-case";
import { ExportTransactionsUseCase } from "@application/use-cases/transaction/export-transactions.use-case";
import { PayInvoiceUseCase } from "@application/use-cases/invoice/pay-invoice.use-case";
import { TypeOrmTransactionRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-transaction.repository";

import { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { EventPublisherPort } from "@domain/ports/out/event-publisher.port";
import { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";

export const financialProviders: Provider[] = [
  // Repositories
  {
    provide: FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
    useClass: TypeOrmAccountRepository,
  },
  {
    provide: FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
    useClass: TypeOrmCreditCardRepository,
  },
  {
    provide: FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
    useClass: TypeOrmInvoiceRepository,
  },

  // Services
  {
    provide: FINANCIAL_DI_TOKENS.EVENT_PUBLISHER_PORT,
    useClass: RabbitMqPublisherAdapter,
  },
  {
    provide: FINANCIAL_DI_TOKENS.CRYPTO_HELPER,
    useFactory: (configService: ConfigService) => {
      const key = configService.getOrThrow<string>("ENCRYPTION_KEY");
      return new CryptoHelper(key);
    },
    inject: [ConfigService],
  },

  // Use Cases
  {
    provide: FINANCIAL_DI_TOKENS.GET_ACCOUNTS_SUMMARY_PORT,
    useFactory: (
      accountRepo: AccountRepositoryPort,
      cardRepo: CreditCardRepositoryPort,
      invoiceRepo: InvoiceRepositoryPort,
    ) => new GetAccountsSummaryUseCase(accountRepo, cardRepo, invoiceRepo),
    inject: [
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
    ],
  },
  {
    provide: FINANCIAL_DI_TOKENS.MANAGE_ACCOUNT_PORT,
    useFactory: (
      accountRepo: AccountRepositoryPort,
      publisher: EventPublisherPort,
    ) => new ManageAccountUseCase(accountRepo, publisher),
    inject: [
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.EVENT_PUBLISHER_PORT,
    ],
  },
  {
    provide: FINANCIAL_DI_TOKENS.MANAGE_CREDIT_CARD_PORT,
    useFactory: (
      cardRepo: CreditCardRepositoryPort,
      invoiceRepo: InvoiceRepositoryPort,
      accountRepo: AccountRepositoryPort,
      publisher: EventPublisherPort,
    ) =>
      new ManageCreditCardUseCase(
        cardRepo,
        invoiceRepo,
        accountRepo,
        publisher,
      ),
    inject: [
      FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.EVENT_PUBLISHER_PORT,
    ],
  },
  {
    provide: FINANCIAL_DI_TOKENS.GET_INVOICE_PROJECTIONS_PORT,
    useFactory: (
      cardRepo: CreditCardRepositoryPort,
      invoiceRepo: InvoiceRepositoryPort,
    ) => new GetInvoiceProjectionsUseCase(cardRepo, invoiceRepo),
    inject: [
      FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
    ],
  },
  {
    provide: FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
    useClass: TypeOrmTransactionRepository,
  },
  {
    provide: FINANCIAL_DI_TOKENS.LIST_TRANSACTIONS_PORT,
    useFactory: (txRepo: TransactionRepositoryPort) =>
      new ListTransactionsUseCase(txRepo),
    inject: [FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT],
  },
  {
    provide: FINANCIAL_DI_TOKENS.MANAGE_TRANSACTION_PORT,
    useFactory: (
      dataSource: DataSource,
      txRepo: TransactionRepositoryPort,
      accountRepo: AccountRepositoryPort,
      cardRepo: CreditCardRepositoryPort,
      invoiceRepo: InvoiceRepositoryPort,
    ) =>
      new ManageTransactionUseCase(
        dataSource,
        txRepo,
        accountRepo,
        cardRepo,
        invoiceRepo,
      ),
    inject: [
      DataSource,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
    ],
  },
  {
    provide: FINANCIAL_DI_TOKENS.EXPORT_TRANSACTIONS_PORT,
    useFactory: (txRepo: TransactionRepositoryPort) =>
      new ExportTransactionsUseCase(txRepo),
    inject: [FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT],
  },
  {
    provide: FINANCIAL_DI_TOKENS.PAY_INVOICE_PORT,
    useFactory: (
      dataSource: DataSource,
      cardRepo: CreditCardRepositoryPort,
      accountRepo: AccountRepositoryPort,
      invoiceRepo: InvoiceRepositoryPort,
      txRepo: TransactionRepositoryPort,
    ) =>
      new PayInvoiceUseCase(
        dataSource,
        cardRepo,
        accountRepo,
        invoiceRepo,
        txRepo,
      ),
    inject: [
      DataSource,
      FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
    ],
  },
];
