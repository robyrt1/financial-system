import { Category } from "@domain/entities/category.entity";
import type { UpdateCategoryBudgetPort } from "@domain/ports/in/category-in.ports";
import type { CategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import { CategoryNotFoundException } from "@domain/exceptions/category.exceptions";

export class UpdateCategoryBudgetUseCase implements UpdateCategoryBudgetPort {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(
    categoryId: string,
    userId: string,
    budgetLimit: number | null,
  ): Promise<Category> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category || (category.userId !== userId && !category.isSystem)) {
      throw new CategoryNotFoundException(categoryId);
    }

    category.budgetLimit = budgetLimit;
    return this.categoryRepository.save(category);
  }
}
