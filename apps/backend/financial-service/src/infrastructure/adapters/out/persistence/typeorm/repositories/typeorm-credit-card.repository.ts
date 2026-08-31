import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { CreditCard } from "@domain/entities/credit-card.entity";
import { CreditCardORMEntity } from "../entities/credit-card.orm-entity";
import { CreditCardMapper } from "../mappers/credit-card.mapper";
import { TypeOrmUnitOfWorkAdapter } from "../../typeorm-unit-of-work.adapter";

@Injectable()
export class TypeOrmCreditCardRepository implements CreditCardRepositoryPort {
  constructor(
    @InjectRepository(CreditCardORMEntity)
    private readonly repository: Repository<CreditCardORMEntity>,
  ) {}

  private getRepository(entityManager?: any): Repository<CreditCardORMEntity> {
    const manager = entityManager || TypeOrmUnitOfWorkAdapter.getStoreManager();
    return manager
      ? manager.getRepository(CreditCardORMEntity)
      : this.repository;
  }

  async findById(id: string, entityManager?: any): Promise<CreditCard | null> {
    const repo = this.getRepository(entityManager);
    const orm = await repo.findOne({ where: { id } });
    return orm ? CreditCardMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<CreditCard[]> {
    const repo = this.getRepository();
    const orms = await repo.find({ where: { userId } });
    return orms.map((orm) => CreditCardMapper.toDomain(orm));
  }

  async save(card: CreditCard, entityManager?: any): Promise<void> {
    const repo = this.getRepository(entityManager);
    const orm = CreditCardMapper.toORM(card);
    await repo.save(orm);
  }
}
