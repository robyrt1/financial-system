import { Transaction } from "../../entities/transaction.entity";
import { CreateTransactionCommand } from "./manage-transaction.port";

export const CREATE_TRANSACTION_USE_CASE = Symbol(
  "CREATE_TRANSACTION_USE_CASE",
);

export interface CreateTransactionPort {
  execute(userId: string, cmd: CreateTransactionCommand): Promise<Transaction>;
}
