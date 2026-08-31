import { Transaction } from "../../entities/transaction.entity";
import { UpdateTransactionCommand } from "./manage-transaction.port";

export const UPDATE_TRANSACTION_USE_CASE = Symbol(
  "UPDATE_TRANSACTION_USE_CASE",
);

export interface UpdateTransactionPort {
  execute(
    userId: string,
    id: string,
    cmd: UpdateTransactionCommand,
  ): Promise<Transaction>;
}
