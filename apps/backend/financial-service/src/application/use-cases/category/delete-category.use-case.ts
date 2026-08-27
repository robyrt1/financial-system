import type { DeleteCategoryPort } from "@domain/ports/in/category-in.ports";
import type { CategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import { CategoryNotFoundException } from "@domain/exceptions/category.exceptions";

export class DeleteCategoryUseCase implements DeleteCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(categoryId: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category || (category.userId !== userId && !category.isSystem)) {
      throw new CategoryNotFoundException(categoryId);
    }

    // System categories cannot be deleted by users
    if (category.isSystem) {
      throw new Error("SYSTEM_CATEGORY_NODELETE");
    }

    await this.categoryRepository.delete(categoryId);
  }
}
