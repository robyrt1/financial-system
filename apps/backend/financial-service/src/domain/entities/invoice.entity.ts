export type InvoiceStatus = "OPEN" | "CLOSED" | "PAID";

export interface InvoiceProps {
  id: string;
  creditCardId: string;
  month: number;
  year: number;
  totalAmount: number;
  status: InvoiceStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Invoice {
  public readonly id: string;
  public readonly creditCardId: string;
  public readonly month: number;
  public readonly year: number;
  public totalAmount: number;
  public status: InvoiceStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: InvoiceProps) {
    this.id = props.id;
    this.creditCardId = props.creditCardId;
    this.month = props.month;
    this.year = props.year;
    this.totalAmount = props.totalAmount;
    this.status = props.status;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public pay(): void {
    this.status = "PAID";
  }
}
