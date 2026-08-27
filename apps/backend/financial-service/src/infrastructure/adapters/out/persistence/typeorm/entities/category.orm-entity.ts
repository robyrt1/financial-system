import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { SubcategoryORMEntity } from "./subcategory.orm-entity";

@Entity("categories")
export class CategoryORMEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid", { nullable: true })
  userId!: string | null;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column()
  icon!: string;

  @Column()
  color!: string;

  @Column({ default: false })
  isSystem!: boolean;

  @Column("decimal", { precision: 15, scale: 2, nullable: true })
  budgetLimit!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => SubcategoryORMEntity, (subcategory) => subcategory.category)
  subcategories!: SubcategoryORMEntity[];
}
