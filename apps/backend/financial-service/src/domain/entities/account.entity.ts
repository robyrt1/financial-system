export type AccountType =
  "CHECKING" | "SAVINGS" | "INVESTMENT" | "BUSINESS" | "WALLET";
export type SyncStatus = "SYNCED" | "PENDING" | "FAILED";

export interface EncryptedDetails {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export interface AccountProps {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  syncStatus: SyncStatus;
  encryptedDetails: EncryptedDetails;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly type: AccountType;
  public balance: number;
  public readonly currency: string;
  public syncStatus: SyncStatus;
  public readonly encryptedDetails: EncryptedDetails;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.type = props.type;
    this.balance = props.balance;
    this.currency = props.currency;
    this.syncStatus = props.syncStatus;
    this.encryptedDetails = props.encryptedDetails;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
