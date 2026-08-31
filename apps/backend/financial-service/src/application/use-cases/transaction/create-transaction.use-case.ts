import { Injectable } from "@nestjs/common";
import type { CreateTransactionPort } from "@domain/ports/in/create-transaction.port";
import { CreateTransactionCommand } from "@domain/ports/in/manage-transaction.port";
import { Transaction } from "@domain/entities/transaction.entity";
import type { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import type { SubcategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import type { UnitOfWorkPort } from "@domain/ports/out/unit-of-work.port";
import { AccountTransactionStrategy } from "./strategies/account-transaction.strategy";
import { CreditCardTransactionStrategy } from "./strategies/credit-card-transaction.strategy";
import { Notification } from "@domain/notification/notification";
import { NotificationError } from "@domain/notification/notification.error";

@Injectable()
export class CreateTransactionUseCase implements CreateTransactionPort {
  constructor(
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly subcategoryRepository: SubcategoryRepositoryPort,
    private readonly accountStrategy: AccountTransactionStrategy,
    private readonly creditCardStrategy: CreditCardTransactionStrategy,
  ) {}

  async execute(
    userId: string,
    cmd: CreateTransactionCommand,
  ): Promise<Transaction> {
    const notification = new Notification();

    if (cmd.subcategoryId) {
      if (!cmd.categoryId) {
        notification.addError({
          field: "categoryId",
          message:
            "Categoria pai é obrigatória quando subcategoria é informada.",
        });
      } else {
        const subcategory = await this.subcategoryRepository.findById(
          cmd.subcategoryId,
        );
        if (!subcategory) {
          notification.addError({
            field: "subcategoryId",
            message: "Subcategoria não encontrada.",
          });
        } else if (subcategory.categoryId !== cmd.categoryId) {
          notification.addError({
            field: "subcategoryId",
            message:
              "A subcategoria informada não pertence à categoria selecionada.",
          });
        }
      }
    }

    const paymentMethod = cmd.paymentMethod || "ACCOUNT";
    const strategy =
      paymentMethod === "CREDIT_CARD"
        ? this.creditCardStrategy
        : this.accountStrategy;

    await strategy.validateCreation(cmd, notification);

    if (notification.hasErrors()) {
      throw new NotificationError(notification.getErrors());
    }

    return this.unitOfWork.executeInTransaction(async () => {
      const transaction = await strategy.processCreation(userId, cmd);
      await this.transactionRepository.save(transaction);
      return transaction;
    });
  }
}
