import { Category } from "@domain/entities/category.entity";
import type {
  CreateCategoryCommand,
  CreateCategoryPort,
} from "@domain/ports/in/category-in.ports";
import type { CategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import { randomUUID } from "crypto";

export class CreateCategoryUseCase implements CreateCategoryPort {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const category = new Category({
      id: randomUUID(),
      userId: command.userId,
      name: command.name,
      type: command.type,
      icon: command.icon,
      color: command.color,
      isSystem: false,
      budgetLimit: command.budgetLimit ?? null,
    });

    return this.categoryRepository.save(category);
  }
}
