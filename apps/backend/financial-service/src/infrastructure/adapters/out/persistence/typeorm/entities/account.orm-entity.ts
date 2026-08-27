import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("accounts")
export class AccountORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  userId!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ default: "BRL" })
  currency!: string;

  @Column()
  syncStatus!: string;

  @Column("jsonb")
  encryptedDetails!: {
    encryptedData: string;
    iv: string;
    authTag: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
