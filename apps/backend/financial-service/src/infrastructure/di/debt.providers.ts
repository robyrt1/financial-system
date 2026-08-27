import { Provider } from "@nestjs/common";
import { DEBT_IN_PORTS, DEBT_OUT_PORTS, FINANCIAL_DI_TOKENS } from "./tokens";

// Out Ports
import { TypeORMDebtRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-debt.repository";
import { DebtRepositoryPort } from "../../domain/ports/out/debt-repository.port";
import { ManageTransactionPort } from "../../domain/ports/in/manage-transaction.port";

// In Ports
import { GetDebtsOverviewUseCase } from "../../application/use-cases/debt/get-debts-overview.use-case";
import { CreateDebtUseCase } from "../../application/use-cases/debt/create-debt.use-case";
import { PayDebtInstallmentUseCase } from "../../application/use-cases/debt/pay-debt-installment.use-case";
import { AmortizeDebtUseCase } from "../../application/use-cases/debt/amortize-debt.use-case";
import { SimulateAmortizationUseCase } from "../../application/use-cases/debt/simulate-amortization.use-case";

export const debtProviders: Provider[] = [
  {
    provide: DEBT_OUT_PORTS.REPOSITORY,
    useClass: TypeORMDebtRepository,
  },
  {
    provide: DEBT_IN_PORTS.GET_OVERVIEW,
    useFactory: (repository: DebtRepositoryPort) =>
      new GetDebtsOverviewUseCase(repository),
    inject: [DEBT_OUT_PORTS.REPOSITORY],
  },
  {
    provide: DEBT_IN_PORTS.CREATE,
    useFactory: (repository: DebtRepositoryPort) =>
      new CreateDebtUseCase(repository),
    inject: [DEBT_OUT_PORTS.REPOSITORY],
  },
  {
    provide: DEBT_IN_PORTS.PAY_INSTALLMENT,
    useFactory: (
      repository: DebtRepositoryPort,
      transactionPort: ManageTransactionPort,
    ) => new PayDebtInstallmentUseCase(repository, transactionPort),
    inject: [
      DEBT_OUT_PORTS.REPOSITORY,
      FINANCIAL_DI_TOKENS.MANAGE_TRANSACTION_PORT,
    ],
  },
  {
    provide: DEBT_IN_PORTS.AMORTIZE,
    useFactory: (
      repository: DebtRepositoryPort,
      transactionPort: ManageTransactionPort,
    ) => new AmortizeDebtUseCase(repository, transactionPort),
    inject: [
      DEBT_OUT_PORTS.REPOSITORY,
      FINANCIAL_DI_TOKENS.MANAGE_TRANSACTION_PORT,
    ],
  },
  {
    provide: DEBT_IN_PORTS.SIMULATE,
    useFactory: (repository: DebtRepositoryPort) =>
      new SimulateAmortizationUseCase(repository),
    inject: [DEBT_OUT_PORTS.REPOSITORY],
  },
];
