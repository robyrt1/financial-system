import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subcategory } from "@domain/entities/subcategory.entity";
import { SubcategoryRepositoryPort } from "@domain/ports/out/category-out.ports";
import { SubcategoryORMEntity } from "@infrastructure/adapters/out/persistence/typeorm/entities/subcategory.orm-entity";

@Injectable()
export class TypeORMSubcategoryRepository implements SubcategoryRepositoryPort {
  constructor(
    @InjectRepository(SubcategoryORMEntity)
    private readonly repository: Repository<SubcategoryORMEntity>,
  ) {}

  private mapToDomain(ormEntity: SubcategoryORMEntity): Subcategory {
    return new Subcategory({
      id: ormEntity.id,
      categoryId: ormEntity.categoryId,
      userId: ormEntity.userId,
      name: ormEntity.name,
      createdAt: ormEntity.createdAt,
    });
  }

  private mapToOrm(domainEntity: Subcategory): SubcategoryORMEntity {
    const ormEntity = new SubcategoryORMEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.categoryId = domainEntity.categoryId;
    ormEntity.userId = domainEntity.userId;
    ormEntity.name = domainEntity.name;
    ormEntity.createdAt = domainEntity.createdAt;
    return ormEntity;
  }

  async save(subcategory: Subcategory): Promise<Subcategory> {
    const ormEntity = this.mapToOrm(subcategory);
    const saved = await this.repository.save(ormEntity);
    return this.mapToDomain(saved);
  }

  async findById(id: string): Promise<Subcategory | null> {
    const found = await this.repository.findOne({ where: { id } });
    if (!found) return null;
    return this.mapToDomain(found);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
