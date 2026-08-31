import { Inject, Injectable } from "@nestjs/common";
import type { BulkTransactionActionPort } from "@domain/ports/in/bulk-transaction-action.port";
import { BulkTransactionActionCommand } from "@domain/ports/in/manage-transaction.port";
import type { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import type { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import type { UnitOfWorkPort } from "@domain/ports/out/unit-of-work.port";
import { DELETE_TRANSACTION_USE_CASE } from "@domain/ports/in/delete-transaction.port";
import type { DeleteTransactionPort } from "@domain/ports/in/delete-transaction.port";

@Injectable()
export class BulkTransactionActionUseCase implements BulkTransactionActionPort {
  constructor(
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(DELETE_TRANSACTION_USE_CASE)
    private readonly deleteTransactionUseCase: DeleteTransactionPort,
  ) {}

  async execute(
    userId: string,
    cmd: BulkTransactionActionCommand,
  ): Promise<void> {
    return this.unitOfWork.executeInTransaction(async () => {
      for (const id of cmd.transactionIds) {
        if (cmd.action === "SETTLE") {
          const transaction = await this.transactionRepository.findById(id);
          if (
            transaction &&
            transaction.userId === userId &&
            transaction.status !== "SETTLED"
          ) {
            if (transaction.paymentMethod === "CREDIT_CARD") {
              transaction.settle();
              await this.transactionRepository.save(transaction);
            } else {
              const account = await this.accountRepository.findById(
                transaction.accountId,
              );
              if (account) {
                let destAccount: any = null;
                if (
                  transaction.type === "TRANSFER" &&
                  transaction.destinationAccountId
                ) {
                  destAccount = await this.accountRepository.findById(
                    transaction.destinationAccountId,
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
                  await this.accountRepository.save(destAccount);
                }

                transaction.settle();
                await this.accountRepository.save(account);
                await this.transactionRepository.save(transaction);
              }
            }
          }
        } else if (cmd.action === "DELETE") {
          await this.deleteTransactionUseCase.execute(userId, id);
        }
      }
    });
  }
}
