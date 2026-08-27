import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreditCardRepositoryPort } from "@domain/ports/out/credit-card-repository.port";
import { CreditCard } from "@domain/entities/credit-card.entity";
import { CreditCardORMEntity } from "../entities/credit-card.orm-entity";
import { CreditCardMapper } from "../mappers/credit-card.mapper";

@Injectable()
export class TypeOrmCreditCardRepository implements CreditCardRepositoryPort {
  constructor(
    @InjectRepository(CreditCardORMEntity)
    private readonly repository: Repository<CreditCardORMEntity>,
  ) {}

  async findById(id: string, entityManager?: any): Promise<CreditCard | null> {
    const repo = entityManager
      ? entityManager.getRepository(CreditCardORMEntity)
      : this.repository;
    const orm = await repo.findOne({ where: { id } });
    return orm ? CreditCardMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<CreditCard[]> {
    const orms = await this.repository.find({ where: { userId } });
    return orms.map((orm) => CreditCardMapper.toDomain(orm));
  }

  async save(card: CreditCard, entityManager?: any): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(CreditCardORMEntity)
      : this.repository;
    const orm = CreditCardMapper.toORM(card);
    await repo.save(orm);
  }
}
