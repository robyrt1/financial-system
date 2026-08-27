import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("debts")
@Index(["userId", "status"])
@Index(["userId", "monthlyInterestRate"])
export class DebtORMEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "creditor_name", type: "varchar" })
  creditorName!: string;

  @Column({ type: "varchar" })
  type!: string;

  @Column({ name: "original_amount", type: "decimal", precision: 12, scale: 2 })
  originalAmount!: number;

  @Column({
    name: "remaining_balance",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  remainingBalance!: number;

  @Column({ name: "total_installments", type: "int" })
  totalInstallments!: number;

  @Column({ name: "paid_installments", type: "int" })
  paidInstallments!: number;

  @Column({ name: "monthly_payment", type: "decimal", precision: 12, scale: 2 })
  monthlyPayment!: number;

  @Column({
    name: "monthly_interest_rate",
    type: "decimal",
    precision: 6,
    scale: 4,
  })
  monthlyInterestRate!: number;

  @Column({ name: "due_day", type: "int", nullable: true })
  dueDay!: number | null;

  @Column({ name: "encrypted_contract_data", type: "text", nullable: true })
  encryptedContractData!: string | null;

  @Column({ type: "varchar" })
  status!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
