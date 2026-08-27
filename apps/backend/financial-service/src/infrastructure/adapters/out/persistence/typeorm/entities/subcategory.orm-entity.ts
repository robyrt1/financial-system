import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CategoryORMEntity } from "./category.orm-entity";

@Entity("subcategories")
export class SubcategoryORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  categoryId!: string;

  @Column("uuid", { nullable: true })
  userId!: string | null;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => CategoryORMEntity, (category) => category.subcategories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "categoryId" })
  category!: CategoryORMEntity;
}
