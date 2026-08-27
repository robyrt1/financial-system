import { Category } from "../../entities/category.entity";
import { Subcategory } from "../../entities/subcategory.entity";
import {
  CategoryResponseDto,
  ListCategoriesQueryDto,
} from "@application/dtos/category.dtos";

export const CATEGORY_REPOSITORY = "CategoryRepositoryPort";
export interface CategoryRepositoryPort {
  save(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  delete(id: string): Promise<void>;
  listWithBudgets(
    userId: string,
    query: ListCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]>;
}

export const SUBCATEGORY_REPOSITORY = "SubcategoryRepositoryPort";
export interface SubcategoryRepositoryPort {
  save(subcategory: Subcategory): Promise<Subcategory>;
}
