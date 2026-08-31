import { Transaction } from "@domain/entities/transaction.entity";
import { CreateTransactionCommand } from "@domain/ports/in/manage-transaction.port";
import { Notification } from "@domain/notification/notification";

export interface TransactionStrategy {
  validateCreation(
    cmd: CreateTransactionCommand,
    notification: Notification,
  ): Promise<void>;
  processCreation(
    userId: string,
    cmd: CreateTransactionCommand,
  ): Promise<Transaction>;
  revertEffects(transaction: Transaction): Promise<void>;
  applyEffects(transaction: Transaction): Promise<void>;
}
