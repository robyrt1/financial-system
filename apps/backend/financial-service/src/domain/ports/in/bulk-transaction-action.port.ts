import { BulkTransactionActionCommand } from "./manage-transaction.port";

export const BULK_TRANSACTION_ACTION_USE_CASE = Symbol(
  "BULK_TRANSACTION_ACTION_USE_CASE",
);

export interface BulkTransactionActionPort {
  execute(userId: string, cmd: BulkTransactionActionCommand): Promise<void>;
}
