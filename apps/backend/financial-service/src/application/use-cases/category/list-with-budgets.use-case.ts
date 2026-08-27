import {
  CategoryResponseDto,
  ListCategoriesQueryDto,
} from "@application/dtos/category.dtos";
import type { ListCategoriesWithBudgetPort } from "@domain/ports/in/category-in.ports";
import type { CategoryRepositoryPort } from "@domain/ports/out/category-out.ports";

export class ListCategoriesUseCase implements ListCategoriesWithBudgetPort {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(
    userId: string,
    query: ListCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]> {
    return this.categoryRepository.listWithBudgets(userId, query);
  }
}
