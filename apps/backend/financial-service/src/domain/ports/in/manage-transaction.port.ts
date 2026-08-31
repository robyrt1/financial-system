import { Transaction } from "../../entities/transaction.entity";

export interface CreateTransactionCommand {
  accountId?: string;
  categoryId: string | null;
  subcategoryId?: string | null;
  destinationAccountId: string | null;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status: "SETTLED" | "PENDING" | "SCHEDULED";
  date: string;
  tags?: string[];
  encryptedDetails?: {
    encryptedData: string;
    iv: string;
    authTag: string;
  } | null;
  paymentMethod?: "ACCOUNT" | "CREDIT_CARD";
  creditCardId?: string;
  installments?: number;
}

export interface UpdateTransactionCommand {
  accountId?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  destinationAccountId?: string | null;
  description?: string;
  amount?: number;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  status?: "SETTLED" | "PENDING" | "SCHEDULED";
  date?: string;
  tags?: string[];
  encryptedDetails?: {
    encryptedData: string;
    iv: string;
    authTag: string;
  } | null;
  paymentMethod?: "ACCOUNT" | "CREDIT_CARD";
  creditCardId?: string;
  installments?: number;
}

export interface BulkTransactionActionCommand {
  transactionIds: string[];
  action: "SETTLE" | "DELETE";
}

export interface ManageTransactionPort {
  create(userId: string, cmd: CreateTransactionCommand): Promise<Transaction>;
  update(
    userId: string,
    id: string,
    cmd: UpdateTransactionCommand,
  ): Promise<Transaction>;
  delete(userId: string, id: string): Promise<void>;
  bulkAction(userId: string, cmd: BulkTransactionActionCommand): Promise<void>;
}
