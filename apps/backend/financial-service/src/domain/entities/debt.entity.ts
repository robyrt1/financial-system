export type DebtType =
  | "LOAN"
  | "FINANCING"
  | "RENEGOTIATION"
  | "INSTALLMENT_STORE"
  | "CREDIT_CARD_PARCEL"
  | "INFORMAL_DEBT"
  | "OVERDRAFT"
  | "TAXES_GOV";
export type DebtStatus = "ACTIVE" | "PAID_OFF";

export interface DebtProps {
  id?: string;
  userId: string;
  creditorName: string;
  type: DebtType;
  originalAmount: number;
  remainingBalance: number;
  totalInstallments: number;
  paidInstallments: number;
  monthlyPayment: number;
  monthlyInterestRate: number;
  dueDay?: number;
  encryptedContractData?: string;
  status?: DebtStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Debt {
  private readonly _id?: string;
  private readonly _userId: string;
  private readonly _creditorName: string;
  private readonly _type: DebtType;
  private readonly _originalAmount: number;
  private _remainingBalance: number;
  private readonly _totalInstallments: number;
  private _paidInstallments: number;
  private readonly _monthlyPayment: number;
  private readonly _monthlyInterestRate: number;
  private readonly _dueDay?: number;
  private readonly _encryptedContractData?: string;
  private _status: DebtStatus;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: DebtProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._creditorName = props.creditorName;
    this._type = props.type;
    this._originalAmount = props.originalAmount;
    this._remainingBalance = props.remainingBalance;
    this._totalInstallments = props.totalInstallments;
    this._paidInstallments = props.paidInstallments;
    this._monthlyPayment = props.monthlyPayment;
    this._monthlyInterestRate = props.monthlyInterestRate;
    this._dueDay = props.dueDay;
    this._encryptedContractData = props.encryptedContractData;
    this._status =
      props.status ||
      (this._paidInstallments >= this._totalInstallments
        ? "PAID_OFF"
        : "ACTIVE");
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id() {
    return this._id;
  }
  get userId() {
    return this._userId;
  }
  get creditorName() {
    return this._creditorName;
  }
  get type() {
    return this._type;
  }
  get originalAmount() {
    return this._originalAmount;
  }
  get remainingBalance() {
    return this._remainingBalance;
  }
  get totalInstallments() {
    return this._totalInstallments;
  }
  get paidInstallments() {
    return this._paidInstallments;
  }
  get monthlyPayment() {
    return this._monthlyPayment;
  }
  get monthlyInterestRate() {
    return this._monthlyInterestRate;
  }
  get dueDay() {
    return this._dueDay;
  }
  get encryptedContractData() {
    return this._encryptedContractData;
  }
  get status() {
    return this._status;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  public payInstallment(amortizedAmount: number): void {
    if (this._status === "PAID_OFF") {
      throw new Error("Debt is already paid off");
    }

    this._paidInstallments += 1;
    this._remainingBalance -= amortizedAmount;

    if (
      this._remainingBalance <= 0 ||
      this._paidInstallments >= this._totalInstallments
    ) {
      this._remainingBalance = 0;
      this._status = "PAID_OFF";
    }
  }

  public amortizeExtraordinary(amount: number): void {
    if (this._status === "PAID_OFF") {
      throw new Error("Debt is already paid off");
    }

    this._remainingBalance -= amount;

    if (this._remainingBalance <= 0) {
      this._remainingBalance = 0;
      this._status = "PAID_OFF";
    }
  }

  public clone(): Debt {
    return new Debt({
      id: this.id,
      userId: this.userId,
      creditorName: this.creditorName,
      type: this.type,
      originalAmount: this.originalAmount,
      remainingBalance: this.remainingBalance,
      totalInstallments: this.totalInstallments,
      paidInstallments: this.paidInstallments,
      monthlyPayment: this.monthlyPayment,
      monthlyInterestRate: this.monthlyInterestRate,
      dueDay: this.dueDay,
      encryptedContractData: this.encryptedContractData,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
