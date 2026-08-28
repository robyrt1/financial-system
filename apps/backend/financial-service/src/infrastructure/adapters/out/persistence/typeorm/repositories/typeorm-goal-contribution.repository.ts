import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { GoalContributionRepositoryPort } from "@domain/ports/out/goal-repository.port";
import { GoalContribution } from "@domain/entities/goal-contribution.entity";
import { GoalContributionORMEntity } from "../entities/goal-contribution.orm-entity";

@Injectable()
export class TypeORMGoalContributionRepository implements GoalContributionRepositoryPort {
  constructor(
    @InjectRepository(GoalContributionORMEntity)
    private readonly ormRepository: Repository<GoalContributionORMEntity>,
  ) {}

  private toDomain(ormEntity: GoalContributionORMEntity): GoalContribution {
    return new GoalContribution({
      id: ormEntity.id,
      goalId: ormEntity.goalId,
      userId: ormEntity.userId,
      sourceAccountId: ormEntity.sourceAccountId,
      amount: Number(ormEntity.amount),
      date: ormEntity.date,
      createdAt: ormEntity.createdAt,
    });
  }

  private toOrm(domainEntity: GoalContribution): GoalContributionORMEntity {
    const orm = new GoalContributionORMEntity();
    orm.id = domainEntity.id;
    orm.goalId = domainEntity.goalId;
    orm.userId = domainEntity.userId;
    orm.sourceAccountId = domainEntity.sourceAccountId;
    orm.amount = domainEntity.amount;
    orm.date = domainEntity.date;
    orm.createdAt = domainEntity.createdAt;
    return orm;
  }

  async save(
    contribution: GoalContribution,
    transactionManager?: any,
  ): Promise<GoalContribution> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    const ormEntity = this.toOrm(contribution);
    const saved = await manager.save(GoalContributionORMEntity, ormEntity);
    return this.toDomain(saved);
  }

  async findByGoalId(
    goalId: string,
    transactionManager?: any,
  ): Promise<GoalContribution[]> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    const ormEntities = await manager.find(GoalContributionORMEntity, {
      where: { goalId },
      order: { date: "DESC", createdAt: "DESC" } as any,
    });
    return ormEntities.map((orm) => this.toDomain(orm));
  }

  async deleteByGoalId(
    goalId: string,
    transactionManager?: any,
  ): Promise<void> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    await manager.delete(GoalContributionORMEntity, { goalId });
  }
}
