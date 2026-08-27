import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("credit_cards")
export class CreditCardORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  accountId!: string;

  @Column()
  cardName!: string;

  @Column()
  maskedDigits!: string;

  @Column("decimal", { precision: 15, scale: 2 })
  creditLimit!: number;

  @Column("decimal", { precision: 15, scale: 2 })
  availableLimit!: number;

  @Column("int")
  closingDay!: number;

  @Column("int")
  dueDay!: number;

  @Column("jsonb")
  encryptedPayload!: {
    encryptedData: string;
    iv: string;
    authTag: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
