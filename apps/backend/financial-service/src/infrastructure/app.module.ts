import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinancialController } from "./adapters/in/http/controllers/financial.controller";
import { TransactionController } from "./adapters/in/http/controllers/transaction.controller";
import { CategoryController } from "./adapters/in/http/controllers/category.controller";
import { DebtController } from "./adapters/in/http/controllers/debt.controller";
import { financialProviders } from "./di/financial.providers";
import { categoryProviders } from "./di/category.providers";
import { debtProviders } from "./di/debt.providers";
import { AccountORMEntity } from "./adapters/out/persistence/typeorm/entities/account.orm-entity";
import { CreditCardORMEntity } from "./adapters/out/persistence/typeorm/entities/credit-card.orm-entity";
import { InvoiceORMEntity } from "./adapters/out/persistence/typeorm/entities/invoice.orm-entity";
import { TransactionORMEntity } from "./adapters/out/persistence/typeorm/entities/transaction.orm-entity";
import { CategoryORMEntity } from "./adapters/out/persistence/typeorm/entities/category.orm-entity";
import { SubcategoryORMEntity } from "./adapters/out/persistence/typeorm/entities/subcategory.orm-entity";
import { DebtORMEntity } from "./adapters/out/persistence/typeorm/entities/debt.orm-entity";
import { GoalController } from "./adapters/in/http/controllers/goal.controller";
import { goalProviders } from "./di/goal.providers";
import { GoalORMEntity } from "./adapters/out/persistence/typeorm/entities/goal.orm-entity";
import { GoalContributionORMEntity } from "./adapters/out/persistence/typeorm/entities/goal-contribution.orm-entity";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        entities: [
          AccountORMEntity,
          CreditCardORMEntity,
          InvoiceORMEntity,
          TransactionORMEntity,
          CategoryORMEntity,
          SubcategoryORMEntity,
          DebtORMEntity,
          GoalORMEntity,
          GoalContributionORMEntity,
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      AccountORMEntity,
      CreditCardORMEntity,
      InvoiceORMEntity,
      TransactionORMEntity,
      CategoryORMEntity,
      SubcategoryORMEntity,
      DebtORMEntity,
      GoalORMEntity,
      GoalContributionORMEntity,
    ]),
  ],
  controllers: [
    FinancialController,
    TransactionController,
    CategoryController,
    DebtController,
    GoalController,
    DashboardController,
  ],
  providers: [
    ...financialProviders,
    ...categoryProviders,
    ...debtProviders,
    ...goalProviders,
  ],
})
export class AppModule {}
