import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("transactions")
export class TransactionORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  accountId!: string;

  @Column("uuid", { nullable: true })
  categoryId!: string | null;

  @Column("uuid", { nullable: true })
  destinationAccountId!: string | null;

  @Column()
  description!: string;

  @Column("decimal", { precision: 15, scale: 2 })
  amount!: number;

  @Column()
  type!: string;

  @Column()
  status!: string;

  @Column()
  date!: string;

  @Column("jsonb", { default: [] })
  tags!: string[];

  @Column("jsonb", { nullable: true })
  encryptedDetails!: {
    encryptedData: string;
    iv: string;
    authTag: string;
  } | null;

  @Column({ default: "ACCOUNT" })
  paymentMethod!: string;

  @Column("uuid", { nullable: true })
  creditCardId!: string | null;

  @Column("int", { default: 1 })
  installments!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
