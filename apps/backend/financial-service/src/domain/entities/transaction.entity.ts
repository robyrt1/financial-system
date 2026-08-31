export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionStatus = "SETTLED" | "PENDING" | "SCHEDULED";
export type PaymentMethod = "ACCOUNT" | "CREDIT_CARD";

export interface EncryptedDetails {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export interface TransactionProps {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  subcategoryId?: string | null;
  destinationAccountId: string | null;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  tags: string[];
  encryptedDetails: EncryptedDetails | null;
  paymentMethod?: PaymentMethod;
  creditCardId?: string | null;
  installments?: number;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction {
  public readonly id: string;
  public readonly userId: string;
  public readonly accountId: string;
  public readonly categoryId: string | null;
  public readonly subcategoryId: string | null;
  public readonly destinationAccountId: string | null;
  public readonly description: string;
  public amount: number;
  public readonly type: TransactionType;
  public status: TransactionStatus;
  public readonly date: string;
  public readonly tags: string[];
  public readonly encryptedDetails: EncryptedDetails | null;
  public readonly paymentMethod: PaymentMethod;
  public readonly creditCardId: string | null;
  public readonly installments: number;
  public readonly category: { id: string; name: string } | null;
  public readonly subcategory: { id: string; name: string } | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId;
    this.subcategoryId = props.subcategoryId || null;
    this.destinationAccountId = props.destinationAccountId;
    this.description = props.description;
    this.amount = props.amount;
    this.type = props.type;
    this.status = props.status;
    this.date = props.date;
    this.tags = props.tags || [];
    this.encryptedDetails = props.encryptedDetails;
    this.paymentMethod = props.paymentMethod || "ACCOUNT";
    this.creditCardId = props.creditCardId || null;
    this.installments = props.installments || 1;
    this.category = props.category || null;
    this.subcategory = props.subcategory || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  settle() {
    this.status = "SETTLED";
  }
}
