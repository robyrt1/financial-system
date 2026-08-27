import {
  SystemCategoryCannotBeDeletedException,
  SystemCategoryCannotBeModifiedException,
} from "../exceptions/category.exceptions";

export type CategoryType = "EXPENSE" | "INCOME" | "INVESTMENT";

export interface CategoryProps {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isSystem: boolean;
  budgetLimit: number | null;
  createdAt?: Date;
}

export class Category {
  public readonly id: string;
  public readonly userId: string | null;
  public name: string;
  public type: CategoryType;
  public icon: string;
  public color: string;
  public readonly isSystem: boolean;
  public budgetLimit: number | null;
  public readonly createdAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.type = props.type;
    this.icon = props.icon;
    this.color = props.color;
    this.isSystem = props.isSystem;
    this.budgetLimit = props.budgetLimit;
    this.createdAt = props.createdAt || new Date();
  }

  updateDetails(name: string, icon: string, color: string): void {
    if (this.isSystem) {
      throw new SystemCategoryCannotBeModifiedException(this.id);
    }
    this.name = name;
    this.icon = icon;
    this.color = color;
  }

  updateBudget(budgetLimit: number | null): void {
    this.budgetLimit = budgetLimit;
  }

  ensureCanBeDeleted(): void {
    if (this.isSystem) {
      throw new SystemCategoryCannotBeDeletedException(this.id);
    }
  }
}
