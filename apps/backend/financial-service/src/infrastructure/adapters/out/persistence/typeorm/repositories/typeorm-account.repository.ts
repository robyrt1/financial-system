import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { Account } from "@domain/entities/account.entity";
import { AccountORMEntity } from "../entities/account.orm-entity";
import { AccountMapper } from "../mappers/account.mapper";

@Injectable()
export class TypeOrmAccountRepository implements AccountRepositoryPort {
  constructor(
    @InjectRepository(AccountORMEntity)
    private readonly repository: Repository<AccountORMEntity>,
  ) {}

  async findById(id: string, entityManager?: any): Promise<Account | null> {
    const repo = entityManager
      ? entityManager.getRepository(AccountORMEntity)
      : this.repository;
    const orm = await repo.findOne({ where: { id } });
    return orm ? AccountMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const orms = await this.repository.find({ where: { userId } });
    return orms.map((orm) => AccountMapper.toDomain(orm));
  }

  async save(account: Account, entityManager?: any): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(AccountORMEntity)
      : this.repository;
    const orm = AccountMapper.toORM(account);
    await repo.save(orm);
  }
}
