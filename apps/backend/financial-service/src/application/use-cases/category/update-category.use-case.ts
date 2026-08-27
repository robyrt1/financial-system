import { Category } from "@domain/entities/category.entity";
import type {
  UpdateCategoryCommand,
  UpdateCategoryPort,
} from "@domain/ports/in/category-in.ports";
import type { CategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import { CategoryNotFoundException } from "@domain/exceptions/category.exceptions";

export class UpdateCategoryUseCase implements UpdateCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const category = await this.categoryRepository.findById(command.categoryId);
    if (
      !category ||
      (category.userId !== command.userId && !category.isSystem)
    ) {
      throw new CategoryNotFoundException(command.categoryId);
    }

    // System categories cannot have their names/icons/colors changed by users
    if (category.isSystem) {
      throw new Error("SYSTEM_CATEGORY_READONLY");
    }

    if (command.name) category.name = command.name;
    if (command.icon) category.icon = command.icon;
    if (command.color) category.color = command.color;

    return this.categoryRepository.save(category);
  }
}
