import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import type { GoalStatus } from "@domain/entities/goal.entity";

@Entity("goals")
@Index(["userId", "status"])
@Index(["userId", "deadline"])
export class GoalORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid", { name: "user_id" })
  userId!: string;

  @Column("varchar", { length: 255 })
  name!: string;

  @Column("decimal", { precision: 12, scale: 2, name: "target_amount" })
  targetAmount!: number;

  @Column("decimal", {
    precision: 12,
    scale: 2,
    name: "current_amount",
    default: 0,
  })
  currentAmount!: number;

  @Column("date")
  deadline!: string;

  @Column("varchar", { length: 255, nullable: true })
  category!: string | null;

  @Column("varchar", { length: 50, nullable: true })
  icon!: string | null;

  @Column("varchar", { length: 50, nullable: true })
  color!: string | null;

  @Column("varchar", { length: 20, default: "IN_PROGRESS" })
  status!: GoalStatus;

  @Column("jsonb", { name: "encrypted_details", nullable: true })
  encryptedDetails!: any | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
