import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("goal_contributions")
@Index(["goalId"])
@Index(["userId"])
export class GoalContributionORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid", { name: "goal_id" })
  goalId!: string;

  @Column("uuid", { name: "user_id" })
  userId!: string;

  @Column("uuid", { name: "source_account_id" })
  sourceAccountId!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("date")
  date!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
