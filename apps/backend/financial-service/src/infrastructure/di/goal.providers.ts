import { Provider } from "@nestjs/common";
import { DataSource } from "typeorm";
import { GOAL_IN_PORTS, GOAL_OUT_PORTS, FINANCIAL_DI_TOKENS } from "./tokens";
import { TypeORMGoalRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-goal.repository";
import { TypeORMGoalContributionRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-goal-contribution.repository";

import { GetGoalsOverviewUseCase } from "../../application/use-cases/goal/get-goals-overview.use-case";
import { CreateGoalUseCase } from "../../application/use-cases/goal/create-goal.use-case";
import { UpdateGoalUseCase } from "../../application/use-cases/goal/update-goal.use-case";
import { DepositGoalUseCase } from "../../application/use-cases/goal/deposit-goal.use-case";
import { DeleteGoalUseCase } from "../../application/use-cases/goal/delete-goal.use-case";
import { RedeemGoalUseCase } from "../../application/use-cases/goal/redeem-goal.use-case";

import {
  GoalRepositoryPort,
  GoalContributionRepositoryPort,
} from "../../domain/ports/out/goal-repository.port";
import { AccountRepositoryPort } from "../../domain/ports/out/account-repository.port";
import { TransactionRepositoryPort } from "../../domain/ports/out/transaction-repository.port";

export const goalProviders: Provider[] = [
  // Repositories
  {
    provide: GOAL_OUT_PORTS.REPOSITORY,
    useClass: TypeORMGoalRepository,
  },
  {
    provide: GOAL_OUT_PORTS.CONTRIBUTION_REPOSITORY,
    useClass: TypeORMGoalContributionRepository,
  },

  // Use Cases
  {
    provide: GOAL_IN_PORTS.GET_OVERVIEW,
    useFactory: (goalRepo: GoalRepositoryPort) =>
      new GetGoalsOverviewUseCase(goalRepo),
    inject: [GOAL_OUT_PORTS.REPOSITORY],
  },
  {
    provide: GOAL_IN_PORTS.DEPOSIT,
    useFactory: (
      dataSource: DataSource,
      goalRepo: GoalRepositoryPort,
      contribRepo: GoalContributionRepositoryPort,
      accountRepo: AccountRepositoryPort,
      txRepo: TransactionRepositoryPort,
    ) =>
      new DepositGoalUseCase(
        dataSource,
        goalRepo,
        contribRepo,
        accountRepo,
        txRepo,
      ),
    inject: [
      DataSource,
      GOAL_OUT_PORTS.REPOSITORY,
      GOAL_OUT_PORTS.CONTRIBUTION_REPOSITORY,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
    ],
  },
  {
    provide: GOAL_IN_PORTS.CREATE,
    useFactory: (
      goalRepo: GoalRepositoryPort,
      depositGoalUseCase: DepositGoalUseCase,
    ) => new CreateGoalUseCase(goalRepo, depositGoalUseCase),
    inject: [GOAL_OUT_PORTS.REPOSITORY, GOAL_IN_PORTS.DEPOSIT],
  },
  {
    provide: GOAL_IN_PORTS.UPDATE,
    useFactory: (goalRepo: GoalRepositoryPort) =>
      new UpdateGoalUseCase(goalRepo),
    inject: [GOAL_OUT_PORTS.REPOSITORY],
  },
  {
    provide: GOAL_IN_PORTS.DELETE,
    useFactory: (
      dataSource: DataSource,
      goalRepo: GoalRepositoryPort,
      contribRepo: GoalContributionRepositoryPort,
      accountRepo: AccountRepositoryPort,
      txRepo: TransactionRepositoryPort,
    ) =>
      new DeleteGoalUseCase(
        dataSource,
        goalRepo,
        contribRepo,
        accountRepo,
        txRepo,
      ),
    inject: [
      DataSource,
      GOAL_OUT_PORTS.REPOSITORY,
      GOAL_OUT_PORTS.CONTRIBUTION_REPOSITORY,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
    ],
  },
  {
    provide: GOAL_IN_PORTS.REDEEM,
    useFactory: (
      dataSource: DataSource,
      goalRepo: GoalRepositoryPort,
      accountRepo: AccountRepositoryPort,
      txRepo: TransactionRepositoryPort,
    ) => new RedeemGoalUseCase(dataSource, goalRepo, accountRepo, txRepo),
    inject: [
      DataSource,
      GOAL_OUT_PORTS.REPOSITORY,
      FINANCIAL_DI_TOKENS.ACCOUNT_REPOSITORY_PORT,
      FINANCIAL_DI_TOKENS.TRANSACTION_REPOSITORY_PORT,
    ],
  },
];
