import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "@domain/entities/category.entity";
import { CategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import {
  CategoryResponseDto,
  ListCategoriesQueryDto,
  CategoryOrigin,
} from "@application/dtos/category.dtos";
import { CategoryORMEntity } from "../entities/category.orm-entity";

@Injectable()
export class TypeORMCategoryRepository implements CategoryRepositoryPort {
  constructor(
    @InjectRepository(CategoryORMEntity)
    private readonly repository: Repository<CategoryORMEntity>,
  ) {}

  private mapToDomain(ormEntity: CategoryORMEntity): Category {
    return new Category({
      id: ormEntity.id,
      userId: ormEntity.userId,
      name: ormEntity.name,
      type: ormEntity.type as any,
      icon: ormEntity.icon,
      color: ormEntity.color,
      isSystem: ormEntity.isSystem,
      budgetLimit: ormEntity.budgetLimit
        ? parseFloat(ormEntity.budgetLimit as any)
        : null,
      createdAt: ormEntity.createdAt,
    });
  }

  private mapToOrm(domainEntity: Category): CategoryORMEntity {
    const ormEntity = new CategoryORMEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.userId = domainEntity.userId;
    ormEntity.name = domainEntity.name;
    ormEntity.type = domainEntity.type;
    ormEntity.icon = domainEntity.icon;
    ormEntity.color = domainEntity.color;
    ormEntity.isSystem = domainEntity.isSystem;
    ormEntity.budgetLimit = domainEntity.budgetLimit;
    ormEntity.createdAt = domainEntity.createdAt;
    return ormEntity;
  }

  async save(category: Category): Promise<Category> {
    const ormEntity = this.mapToOrm(category);
    const saved = await this.repository.save(ormEntity);
    return this.mapToDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const found = await this.repository.findOne({ where: { id } });
    if (!found) return null;
    return this.mapToDomain(found);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async listWithBudgets(
    userId: string,
    query: ListCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]> {
    const qb = this.repository
      .createQueryBuilder("c")
      .leftJoin("c.subcategories", "s")
      .leftJoin(
        "transactions",
        "t",
        "t.categoryId = c.id AND t.status = :status",
        { status: "SETTLED" },
      );

    // Filter by visibility: system categories OR user's custom categories
    qb.where("(c.isSystem = :isSystem OR c.userId = :userId)", {
      isSystem: true,
      userId,
    });

    if (query.month && query.year) {
      qb.andWhere(
        "EXTRACT(MONTH FROM t.date::timestamp) = :month AND EXTRACT(YEAR FROM t.date::timestamp) = :year",
        { month: query.month, year: query.year },
      );
    }

    if (query.type) {
      qb.andWhere("c.type = :type", { type: query.type });
    }

    if (query.origin) {
      if (query.origin === CategoryOrigin.SYSTEM) {
        qb.andWhere("c.isSystem = :filterSystem", { filterSystem: true });
      } else if (query.origin === CategoryOrigin.CUSTOM) {
        qb.andWhere("c.isSystem = :filterSystem", { filterSystem: false });
      }
    }

    if (query.search) {
      qb.andWhere("c.name ILIKE :search", { search: `%${query.search}%` });
    }

    qb.select([
      "c.id as id",
      "c.name as name",
      "c.type as type",
      "c.icon as icon",
      "c.color as color",
      'c.isSystem as "isSystem"',
      'c.budgetLimit as "budgetLimit"',
      'COALESCE(SUM(t.amount), 0) as "spentAmount"',
    ]);

    // To get subcategories we need to aggregate them if we group by category.
    // It's often easier to fetch them in a separate query if the first is highly aggregated,
    // or use jsonb_agg in postgres.
    // Given the complexity of standard TypeORM query builder with jsonb_agg, let's execute the raw query or use two queries.
    // Let's use two queries for simplicity and correctness with subcategories, as it's safe and fast enough.

    // First, get categories with spent amount
    const rawResults = await qb.groupBy("c.id").getRawMany();

    // Second, fetch subcategories for these categories
    const categoryIds = rawResults.map((r) => r.id);
    let subcategories: any[] = [];
    if (categoryIds.length > 0) {
      subcategories = await this.repository.manager.query(
        `SELECT id, name, "categoryId" FROM subcategories WHERE "categoryId" IN (${categoryIds.map((id) => `'${id}'`).join(",")})`,
      );
    }

    return rawResults.map((raw) => {
      const budgetLimit = raw.budgetLimit ? parseFloat(raw.budgetLimit) : null;
      const spentAmount = parseFloat(raw.spentAmount);

      let percentage = 0;
      let status: "SAFE" | "WARNING" | "DANGER" = "SAFE";

      if (budgetLimit && budgetLimit > 0) {
        percentage = (spentAmount / budgetLimit) * 100;
        if (percentage >= 90) {
          status = "DANGER";
        } else if (percentage >= 70) {
          status = "WARNING";
        }
      }

      return {
        id: raw.id,
        name: raw.name,
        type: raw.type,
        icon: raw.icon,
        color: raw.color,
        isSystem: raw.isSystem,
        budgetLimit,
        spentAmount,
        percentage,
        status,
        subcategories: subcategories
          .filter((sub) => sub.categoryId === raw.id)
          .map((sub) => ({ id: sub.id, name: sub.name })),
      };
    });
  }
}
