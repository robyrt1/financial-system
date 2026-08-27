import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("invoices")
export class InvoiceORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  creditCardId!: string;

  @Column("int")
  month!: number;

  @Column("int")
  year!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  totalAmount!: number;

  @Column()
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
