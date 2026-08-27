import { Category, CategoryType } from "../../entities/category.entity";
import { Subcategory } from "../../entities/subcategory.entity";
import {
  CategoryResponseDto,
  ListCategoriesQueryDto,
} from "@application/dtos/category.dtos";

export interface CreateCategoryCommand {
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  budgetLimit?: number | null;
}

export interface UpdateCategoryCommand {
  categoryId: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
}

export interface CreateSubcategoryCommand {
  categoryId: string;
  userId: string;
  name: string;
}

export const LIST_CATEGORIES_USE_CASE = "ListCategoriesUseCase";
export interface ListCategoriesWithBudgetPort {
  execute(
    userId: string,
    query: ListCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]>;
}

export const CREATE_CATEGORY_USE_CASE = "CreateCategoryUseCase";
export interface CreateCategoryPort {
  execute(command: CreateCategoryCommand): Promise<Category>;
}

export const UPDATE_CATEGORY_USE_CASE = "UpdateCategoryUseCase";
export interface UpdateCategoryPort {
  execute(command: UpdateCategoryCommand): Promise<Category>;
}

export const UPDATE_CATEGORY_BUDGET_USE_CASE = "UpdateCategoryBudgetUseCase";
export interface UpdateCategoryBudgetPort {
  execute(
    categoryId: string,
    userId: string,
    budgetLimit: number | null,
  ): Promise<Category>;
}

export const DELETE_CATEGORY_USE_CASE = "DeleteCategoryUseCase";
export interface DeleteCategoryPort {
  execute(categoryId: string, userId: string): Promise<void>;
}

export const CREATE_SUBCATEGORY_USE_CASE = "CreateSubcategoryUseCase";
export interface CreateSubcategoryPort {
  execute(command: CreateSubcategoryCommand): Promise<Subcategory>;
}
