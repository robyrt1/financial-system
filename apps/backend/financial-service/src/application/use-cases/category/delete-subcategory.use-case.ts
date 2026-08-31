import type { DeleteSubcategoryPort } from "@domain/ports/in/category-in.ports";
import type { SubcategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import { SubcategoryNotFoundException } from "@domain/exceptions/category.exceptions";

export class DeleteSubcategoryUseCase implements DeleteSubcategoryPort {
  constructor(
    private readonly subcategoryRepository: SubcategoryRepositoryPort,
  ) {}

  async execute(subcategoryId: string, userId: string): Promise<void> {
    const subcategory =
      await this.subcategoryRepository.findById(subcategoryId);

    if (
      !subcategory ||
      (subcategory.userId !== userId && subcategory.userId !== null)
    ) {
      throw new SubcategoryNotFoundException(subcategoryId);
    }

    await this.subcategoryRepository.delete(subcategoryId);
  }
}
