export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export interface CreditCardProps {
  id: string;
  userId: string;
  accountId: string;
  cardName: string;
  maskedDigits: string;
  creditLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  encryptedPayload: EncryptedPayload;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreditCard {
  public readonly id: string;
  public readonly userId: string;
  public readonly accountId: string;
  public cardName: string;
  public readonly maskedDigits: string;
  public creditLimit: number;
  public availableLimit: number;
  public readonly closingDay: number;
  public readonly dueDay: number;
  public readonly encryptedPayload: EncryptedPayload;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CreditCardProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.cardName = props.cardName;
    this.maskedDigits = props.maskedDigits;
    this.creditLimit = props.creditLimit;
    this.availableLimit = props.availableLimit;
    this.closingDay = props.closingDay;
    this.dueDay = props.dueDay;
    this.encryptedPayload = props.encryptedPayload;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public adjustLimit(newLimit: number): void {
    const spentAmount = this.creditLimit - this.availableLimit;
    if (newLimit < spentAmount) {
      throw new Error(
        "New limit cannot be lower than currently utilized credit",
      );
    }
    this.creditLimit = newLimit;
    this.availableLimit = newLimit - spentAmount;
  }
}
