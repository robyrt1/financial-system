import { Injectable } from "@nestjs/common";
import { TransactionStrategy } from "./transaction-strategy";
import { Transaction } from "@domain/entities/transaction.entity";
import { CreateTransactionCommand } from "@domain/ports/in/manage-transaction.port";
import { Notification } from "@domain/notification/notification";
import type { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { AccountNotFoundError } from "@domain/exceptions/account-not-found.error";
import { randomUUID } from "crypto";

@Injectable()
export class AccountTransactionStrategy implements TransactionStrategy {
  constructor(private readonly accountRepository: AccountRepositoryPort) {}

  async validateCreation(
    cmd: CreateTransactionCommand,
    notification: Notification,
  ): Promise<void> {
    if (!cmd.accountId) {
      notification.addError({
        field: "accountId",
        message: "Conta bancária é obrigatória.",
      });
    }
    if (cmd.type === "TRANSFER" && !cmd.destinationAccountId) {
      notification.addError({
        field: "destinationAccountId",
        message: "Conta de destino é obrigatória para transferências.",
      });
    }
    if (
      cmd.type === "TRANSFER" &&
      cmd.accountId &&
      cmd.accountId === cmd.destinationAccountId
    ) {
      notification.addError({
        field: "destinationAccountId",
        message: "Conta de destino não pode ser igual à conta de origem.",
      });
    }
  }

  async processCreation(
    userId: string,
    cmd: CreateTransactionCommand,
  ): Promise<Transaction> {
    const account = await this.accountRepository.findById(cmd.accountId!);
    if (!account || account.userId !== userId) {
      throw new AccountNotFoundError(cmd.accountId!);
    }

    let destAccount: any = null;
    if (cmd.type === "TRANSFER") {
      destAccount = await this.accountRepository.findById(
        cmd.destinationAccountId!,
      );
      if (!destAccount) {
        throw new AccountNotFoundError(cmd.destinationAccountId!);
      }
    }

    if (cmd.status === "SETTLED") {
      if (cmd.type === "INCOME") {
        account.balance = Number(account.balance) + Number(cmd.amount);
      } else if (cmd.type === "EXPENSE") {
        account.balance = Number(account.balance) - Number(cmd.amount);
      } else if (cmd.type === "TRANSFER" && destAccount) {
        account.balance = Number(account.balance) - Number(cmd.amount);
        destAccount.balance = Number(destAccount.balance) + Number(cmd.amount);
      }
    }

    await this.accountRepository.save(account);
    if (destAccount) {
      await this.accountRepository.save(destAccount);
    }

    return new Transaction({
      id: randomUUID(),
      userId,
      accountId: cmd.accountId!,
      categoryId: cmd.categoryId || null,
      subcategoryId: cmd.subcategoryId || null,
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
  }

  async revertEffects(transaction: Transaction): Promise<void> {
    if (transaction.status === "SETTLED") {
      const account = await this.accountRepository.findById(
        transaction.accountId,
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
          );
          if (destAccount) {
            destAccount.balance =
              Number(destAccount.balance) - Number(transaction.amount);
            await this.accountRepository.save(destAccount);
          }
        }
        await this.accountRepository.save(account);
      }
    }
  }

  async applyEffects(transaction: Transaction): Promise<void> {
    if (transaction.status === "SETTLED") {
      const account = await this.accountRepository.findById(
        transaction.accountId,
      );
      if (!account) {
        throw new AccountNotFoundError(transaction.accountId);
      }

      let destAccount: any = null;
      if (transaction.type === "TRANSFER" && transaction.destinationAccountId) {
        destAccount = await this.accountRepository.findById(
          transaction.destinationAccountId,
        );
        if (!destAccount) {
          throw new AccountNotFoundError(transaction.destinationAccountId);
        }
      }

      if (transaction.type === "INCOME") {
        account.balance = Number(account.balance) + Number(transaction.amount);
      } else if (transaction.type === "EXPENSE") {
        account.balance = Number(account.balance) - Number(transaction.amount);
      } else if (transaction.type === "TRANSFER" && destAccount) {
        account.balance = Number(account.balance) - Number(transaction.amount);
        destAccount.balance =
          Number(destAccount.balance) + Number(transaction.amount);
      }

      await this.accountRepository.save(account);
      if (destAccount) {
        await this.accountRepository.save(destAccount);
      }
    }
  }
}
