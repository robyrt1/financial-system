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
import { CreateTransactionUseCase } from "@application/use-cases/transaction/create-transaction.use-case";
import { UpdateTransactionUseCase } from "@application/use-cases/transaction/update-transaction.use-case";
import { DeleteTransactionUseCase } from "@application/use-cases/transaction/delete-transaction.use-case";
import { BulkTransactionActionUseCase } from "@application/use-cases/transaction/bulk-transaction-action.use-case";
import { ManageTransactionUseCase } from "@application/use-cases/transaction/manage-transaction.use-case";
import { AccountTransactionStrategy } from "@application/use-cases/transaction/strategies/account-transaction.strategy";
import { CreditCardTransactionStrategy } from "@application/use-cases/transaction/strategies/credit-card-transaction.strategy";
import { ExportTransactionsUseCase } from "@application/use-cases/transaction/export-transactions.use-case";
import { PayInvoiceUseCase } from "@application/use-cases/invoice/pay-invoice.use-case";
import { TypeOrmTransactionRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-transaction.repository";
import { GetDashboardMetricsUseCase } from "@application/use-cases/get-dashboard-metrics.use-case";

import { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { EventPublisherPort } from "@domain/ports/out/event-publisher.port";
import { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import { GetAccountsSummaryPort } from "@domain/ports/in/get-accounts-summary.port";
import { SUBCATEGORY_REPOSITORY } from "@domain/ports/out/category-out.ports";
import { UNIT_OF_WORK } from "@domain/ports/out/unit-of-work.port";
import { CREATE_TRANSACTION_USE_CASE } from "@domain/ports/in/create-transaction.port";
import { UPDATE_TRANSACTION_USE_CASE } from "@domain/ports/in/update-transaction.port";
import { DELETE_TRANSACTION_USE_CASE } from "@domain/ports/in/delete-transaction.port";
import { BULK_TRANSACTION_ACTION_USE_CASE } from "@domain/ports/in/bulk-transaction-action.port";
import { TypeOrmUnitOfWorkAdapter } from "../adapters/out/persistence/typeorm-unit-of-work.adapter";

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
    provide: UNIT_OF_WORK,
    useClass: TypeOrmUnitOfWorkAdapter,
  },
  {
    provide: AccountTransactionStrategy,
    useFactory: (accountRepo: AccountRepositoryPort) =>
      new AccountTransactionStrategy(accountRepo),
    inject: [FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT],
  },
  {
    provide: CreditCardTransactionStrategy,
    useFactory: (
      cardRepo: CreditCardRepositoryPort,
      invoiceRepo: InvoiceRepositoryPort,
    ) => new CreditCardTransactionStrategy(cardRepo, invoiceRepo),
    inject: [
      FINANCIAL_DI_TOKENS.CREDIT_CARD_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.INVOICE_REPOSITORY_PORT,
    ],
  },
  {
    provide: CREATE_TRANSACTION_USE_CASE,
    useFactory: (
      uow: any,
      txRepo: TransactionRepositoryPort,
      subcatRepo: any,
      accountStrategy: AccountTransactionStrategy,
      creditCardStrategy: CreditCardTransactionStrategy,
    ) =>
      new CreateTransactionUseCase(
        uow,
        txRepo,
        subcatRepo,
        accountStrategy,
        creditCardStrategy,
      ),
    inject: [
      UNIT_OF_WORK,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
      SUBCATEGORY_REPOSITORY,
      AccountTransactionStrategy,
      CreditCardTransactionStrategy,
    ],
  },
  {
    provide: UPDATE_TRANSACTION_USE_CASE,
    useFactory: (
      uow: any,
      txRepo: TransactionRepositoryPort,
      subcatRepo: any,
      accountStrategy: AccountTransactionStrategy,
      creditCardStrategy: CreditCardTransactionStrategy,
    ) =>
      new UpdateTransactionUseCase(
        uow,
        txRepo,
        subcatRepo,
        accountStrategy,
        creditCardStrategy,
      ),
    inject: [
      UNIT_OF_WORK,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
      SUBCATEGORY_REPOSITORY,
      AccountTransactionStrategy,
      CreditCardTransactionStrategy,
    ],
  },
  {
    provide: DELETE_TRANSACTION_USE_CASE,
    useFactory: (
      uow: any,
      txRepo: TransactionRepositoryPort,
      accountStrategy: AccountTransactionStrategy,
      creditCardStrategy: CreditCardTransactionStrategy,
    ) =>
      new DeleteTransactionUseCase(
        uow,
        txRepo,
        accountStrategy,
        creditCardStrategy,
      ),
    inject: [
      UNIT_OF_WORK,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
      AccountTransactionStrategy,
      CreditCardTransactionStrategy,
    ],
  },
  {
    provide: BULK_TRANSACTION_ACTION_USE_CASE,
    useFactory: (
      uow: any,
      txRepo: TransactionRepositoryPort,
      accountRepo: AccountRepositoryPort,
      deleteUseCase: any,
    ) =>
      new BulkTransactionActionUseCase(uow, txRepo, accountRepo, deleteUseCase),
    inject: [
      UNIT_OF_WORK,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      DELETE_TRANSACTION_USE_CASE,
    ],
  },
  {
    provide: FINANCIAL_DI_TOKENS.MANAGE_TRANSACTION_PORT,
    useFactory: (
      createUseCase: any,
      updateUseCase: any,
      deleteUseCase: any,
      bulkUseCase: any,
    ) =>
      new ManageTransactionUseCase(
        createUseCase,
        updateUseCase,
        deleteUseCase,
        bulkUseCase,
      ),
    inject: [
      CREATE_TRANSACTION_USE_CASE,
      UPDATE_TRANSACTION_USE_CASE,
      DELETE_TRANSACTION_USE_CASE,
      BULK_TRANSACTION_ACTION_USE_CASE,
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
  {
    provide: FINANCIAL_DI_TOKENS.GET_DASHBOARD_METRICS_PORT,
    useFactory: (
      accountsSummaryPort: GetAccountsSummaryPort,
      txRepo: TransactionRepositoryPort,
    ) => new GetDashboardMetricsUseCase(accountsSummaryPort, txRepo),
    inject: [
      FINANCIAL_DI_TOKENS.GET_ACCOUNTS_SUMMARY_PORT,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
    ],
  },
];
