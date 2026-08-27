import { Subcategory } from "@domain/entities/subcategory.entity";
import type {
  CreateSubcategoryCommand,
  CreateSubcategoryPort,
} from "@domain/ports/in/category-in.ports";
import type {
  CategoryRepositoryPort,
  SubcategoryRepositoryPort,
} from "@domain/ports/out/category-out.ports";
import { CategoryNotFoundException } from "@domain/exceptions/category.exceptions";
import { randomUUID } from "crypto";

export class CreateSubcategoryUseCase implements CreateSubcategoryPort {
  constructor(
    private readonly categoryRepository: CategoryRepositoryPort,
    private readonly subcategoryRepository: SubcategoryRepositoryPort,
  ) {}

  async execute(command: CreateSubcategoryCommand): Promise<Subcategory> {
    const category = await this.categoryRepository.findById(command.categoryId);

    if (
      !category ||
      (category.userId !== command.userId && !category.isSystem)
    ) {
      throw new CategoryNotFoundException(command.categoryId);
    }

    const subcategory = new Subcategory({
      id: randomUUID(),
      categoryId: command.categoryId,
      userId: command.userId,
      name: command.name,
    });

    return this.subcategoryRepository.save(subcategory);
  }
}
