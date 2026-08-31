import { Provider } from "@nestjs/common";
import { TypeORMCategoryRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-category.repository";
import { TypeORMSubcategoryRepository } from "../adapters/out/persistence/typeorm/repositories/typeorm-subcategory.repository";
import {
  CATEGORY_REPOSITORY,
  SUBCATEGORY_REPOSITORY,
  CategoryRepositoryPort,
  SubcategoryRepositoryPort,
} from "@domain/ports/out/category-out.ports";
import {
  LIST_CATEGORIES_USE_CASE,
  CREATE_CATEGORY_USE_CASE,
  UPDATE_CATEGORY_USE_CASE,
  UPDATE_CATEGORY_BUDGET_USE_CASE,
  DELETE_CATEGORY_USE_CASE,
  CREATE_SUBCATEGORY_USE_CASE,
  DELETE_SUBCATEGORY_USE_CASE,
} from "@domain/ports/in/category-in.ports";
import { ListCategoriesUseCase } from "@application/use-cases/category/list-with-budgets.use-case";
import { CreateCategoryUseCase } from "@application/use-cases/category/create-category.use-case";
import { UpdateCategoryUseCase } from "@application/use-cases/category/update-category.use-case";
import { UpdateCategoryBudgetUseCase } from "@application/use-cases/category/update-category-budget.use-case";
import { DeleteCategoryUseCase } from "@application/use-cases/category/delete-category.use-case";
import { CreateSubcategoryUseCase } from "@application/use-cases/category/create-subcategory.use-case";
import { DeleteSubcategoryUseCase } from "@application/use-cases/category/delete-subcategory.use-case";

export const categoryProviders: Provider[] = [
  // Repositories
  {
    provide: CATEGORY_REPOSITORY,
    useClass: TypeORMCategoryRepository,
  },
  {
    provide: SUBCATEGORY_REPOSITORY,
    useClass: TypeORMSubcategoryRepository,
  },

  // Use Cases
  {
    provide: LIST_CATEGORIES_USE_CASE,
    useFactory: (repo: CategoryRepositoryPort) =>
      new ListCategoriesUseCase(repo),
    inject: [CATEGORY_REPOSITORY],
  },
  {
    provide: CREATE_CATEGORY_USE_CASE,
    useFactory: (repo: CategoryRepositoryPort) =>
      new CreateCategoryUseCase(repo),
    inject: [CATEGORY_REPOSITORY],
  },
  {
    provide: UPDATE_CATEGORY_USE_CASE,
    useFactory: (repo: CategoryRepositoryPort) =>
      new UpdateCategoryUseCase(repo),
    inject: [CATEGORY_REPOSITORY],
  },
  {
    provide: UPDATE_CATEGORY_BUDGET_USE_CASE,
    useFactory: (repo: CategoryRepositoryPort) =>
      new UpdateCategoryBudgetUseCase(repo),
    inject: [CATEGORY_REPOSITORY],
  },
  {
    provide: DELETE_CATEGORY_USE_CASE,
    useFactory: (repo: CategoryRepositoryPort) =>
      new DeleteCategoryUseCase(repo),
    inject: [CATEGORY_REPOSITORY],
  },
  {
    provide: CREATE_SUBCATEGORY_USE_CASE,
    useFactory: (
      catRepo: CategoryRepositoryPort,
      subcatRepo: SubcategoryRepositoryPort,
    ) => new CreateSubcategoryUseCase(catRepo, subcatRepo),
    inject: [CATEGORY_REPOSITORY, SUBCATEGORY_REPOSITORY],
  },
  {
    provide: DELETE_SUBCATEGORY_USE_CASE,
    useFactory: (repo: SubcategoryRepositoryPort) =>
      new DeleteSubcategoryUseCase(repo),
    inject: [SUBCATEGORY_REPOSITORY],
  },
];
