import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CategoryORMEntity } from "./category.orm-entity";
import { SubcategoryORMEntity } from "./subcategory.orm-entity";

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
  subcategoryId!: string | null;

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

  @ManyToOne(() => CategoryORMEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category!: CategoryORMEntity | null;

  @ManyToOne(() => SubcategoryORMEntity, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "subcategoryId" })
  subcategory!: SubcategoryORMEntity | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
