import { Injectable } from "@nestjs/common";
import type { UpdateTransactionPort } from "@domain/ports/in/update-transaction.port";
import { UpdateTransactionCommand } from "@domain/ports/in/manage-transaction.port";
import { Transaction } from "@domain/entities/transaction.entity";
import type { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import type { SubcategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import type { UnitOfWorkPort } from "@domain/ports/out/unit-of-work.port";
import { AccountTransactionStrategy } from "./strategies/account-transaction.strategy";
import { CreditCardTransactionStrategy } from "./strategies/credit-card-transaction.strategy";
import { Notification } from "@domain/notification/notification";
import { NotificationError } from "@domain/notification/notification.error";

@Injectable()
export class UpdateTransactionUseCase implements UpdateTransactionPort {
  constructor(
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly subcategoryRepository: SubcategoryRepositoryPort,
    private readonly accountStrategy: AccountTransactionStrategy,
    private readonly creditCardStrategy: CreditCardTransactionStrategy,
  ) {}

  async execute(
    userId: string,
    id: string,
    cmd: UpdateTransactionCommand,
  ): Promise<Transaction> {
    return this.unitOfWork.executeInTransaction(async () => {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction || transaction.userId !== userId) {
        throw new Error("Transação não encontrada.");
      }

      // 1. Revert previous effects
      const oldStrategy =
        transaction.paymentMethod === "CREDIT_CARD"
          ? this.creditCardStrategy
          : this.accountStrategy;
      await oldStrategy.revertEffects(transaction);

      // 2. Apply new parameters
      const updatedPaymentMethod =
        cmd.paymentMethod ?? transaction.paymentMethod;
      const updatedAccountId = cmd.accountId ?? transaction.accountId;
      const updatedAmount = cmd.amount ?? transaction.amount;
      const updatedType = cmd.type ?? transaction.type;
      const updatedStatus = cmd.status ?? transaction.status;
      const updatedCategoryId =
        cmd.categoryId !== undefined ? cmd.categoryId : transaction.categoryId;
      const updatedSubcategoryId =
        cmd.subcategoryId !== undefined
          ? cmd.subcategoryId
          : transaction.subcategoryId;
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

      // Validation
      const notification = new Notification();
      if (updatedSubcategoryId) {
        if (!updatedCategoryId) {
          notification.addError({
            field: "categoryId",
            message:
              "Categoria pai é obrigatória quando subcategoria é informada.",
          });
        } else {
          const subcategory =
            await this.subcategoryRepository.findById(updatedSubcategoryId);
          if (!subcategory) {
            notification.addError({
              field: "subcategoryId",
              message: "Subcategoria não encontrada.",
            });
          } else if (subcategory.categoryId !== updatedCategoryId) {
            notification.addError({
              field: "subcategoryId",
              message:
                "A subcategoria informada não pertence à categoria selecionada.",
            });
          }
        }
      }

      if (updatedPaymentMethod === "CREDIT_CARD") {
        if (updatedType !== "EXPENSE") {
          notification.addError({
            field: "type",
            message:
              "Apenas despesas são permitidas em transações de cartão de crédito.",
          });
        }
        if (!updatedCreditCardId) {
          notification.addError({
            field: "creditCardId",
            message: "ID do cartão de crédito é obrigatório.",
          });
        }
      } else {
        if (!updatedAccountId) {
          notification.addError({
            field: "accountId",
            message: "Conta bancária é obrigatória.",
          });
        }
        if (updatedType === "TRANSFER" && !updatedDestinationAccountId) {
          notification.addError({
            field: "destinationAccountId",
            message: "Conta de destino é obrigatória para transferências.",
          });
        }
      }

      if (notification.hasErrors()) {
        throw new NotificationError(notification.getErrors());
      }

      const updatedTransaction = new Transaction({
        id: transaction.id,
        userId,
        accountId: updatedAccountId,
        categoryId: updatedCategoryId,
        subcategoryId: updatedSubcategoryId,
        destinationAccountId: updatedDestinationAccountId,
        description: updatedDescription,
        amount: updatedAmount,
        type: updatedType as any,
        status: updatedStatus as any,
        date: updatedDate,
        tags: updatedTags,
        encryptedDetails: updatedEncDetails,
        paymentMethod: updatedPaymentMethod as any,
        creditCardId: updatedCreditCardId,
        installments: updatedInstallments,
        createdAt: transaction.createdAt,
      });

      // 3. Apply new effects
      const newStrategy =
        updatedPaymentMethod === "CREDIT_CARD"
          ? this.creditCardStrategy
          : this.accountStrategy;
      await newStrategy.applyEffects(updatedTransaction);

      // 4. Save updated transaction
      await this.transactionRepository.save(updatedTransaction);
      return updatedTransaction;
    });
  }
}
