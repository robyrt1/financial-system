export const DELETE_TRANSACTION_USE_CASE = Symbol(
  "DELETE_TRANSACTION_USE_CASE",
);

export interface DeleteTransactionPort {
  execute(userId: string, id: string): Promise<void>;
}
