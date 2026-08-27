import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DebtRepositoryPort } from "../../../../../../domain/ports/out/debt-repository.port";
import { Debt } from "../../../../../../domain/entities/debt.entity";
import { DebtORMEntity } from "../entities/debt.orm-entity";
import { DebtMapper } from "../mappers/debt.mapper";

@Injectable()
export class TypeORMDebtRepository implements DebtRepositoryPort {
  constructor(
    @InjectRepository(DebtORMEntity)
    private readonly repository: Repository<DebtORMEntity>,
  ) {}

  async save(debt: Debt): Promise<Debt> {
    const ormEntity = DebtMapper.toORM(debt);
    const savedEntity = await this.repository.save(ormEntity);
    return DebtMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Debt | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return DebtMapper.toDomain(ormEntity);
  }

  async findByUserId(userId: string): Promise<Debt[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
    return ormEntities.map(DebtMapper.toDomain);
  }

  async findByUserIdAndStatus(userId: string, status: string): Promise<Debt[]> {
    const ormEntities = await this.repository.find({
      where: { userId, status },
      order: { createdAt: "DESC" },
    });
    return ormEntities.map(DebtMapper.toDomain);
  }

  async findAllActiveByUserIdOrderByInterestDesc(
    userId: string,
  ): Promise<Debt[]> {
    const ormEntities = await this.repository.find({
      where: { userId, status: "ACTIVE" },
      order: { monthlyInterestRate: "DESC" },
    });
    return ormEntities.map(DebtMapper.toDomain);
  }

  async findAllActiveByUserIdOrderByBalanceAsc(
    userId: string,
  ): Promise<Debt[]> {
    const ormEntities = await this.repository.find({
      where: { userId, status: "ACTIVE" },
      order: { remainingBalance: "ASC" },
    });
    return ormEntities.map(DebtMapper.toDomain);
  }
}
