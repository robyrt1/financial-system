import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { GoalRepositoryPort } from "@domain/ports/out/goal-repository.port";
import { Goal } from "@domain/entities/goal.entity";
import { GoalORMEntity } from "../entities/goal.orm-entity";

@Injectable()
export class TypeORMGoalRepository implements GoalRepositoryPort {
  constructor(
    @InjectRepository(GoalORMEntity)
    private readonly ormRepository: Repository<GoalORMEntity>,
  ) {}

  private toDomain(ormEntity: GoalORMEntity): Goal {
    return new Goal({
      id: ormEntity.id,
      userId: ormEntity.userId,
      name: ormEntity.name,
      targetAmount: Number(ormEntity.targetAmount),
      currentAmount: Number(ormEntity.currentAmount),
      deadline: ormEntity.deadline,
      category: ormEntity.category || undefined,
      icon: ormEntity.icon || undefined,
      color: ormEntity.color || undefined,
      status: ormEntity.status,
      encryptedDetails: ormEntity.encryptedDetails || undefined,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  private toOrm(domainEntity: Goal): GoalORMEntity {
    const orm = new GoalORMEntity();
    orm.id = domainEntity.id;
    orm.userId = domainEntity.userId;
    orm.name = domainEntity.name;
    orm.targetAmount = domainEntity.targetAmount;
    orm.currentAmount = domainEntity.currentAmount;
    orm.deadline = domainEntity.deadline;
    orm.category = domainEntity.category;
    orm.icon = domainEntity.icon;
    orm.color = domainEntity.color;
    orm.status = domainEntity.status;
    orm.encryptedDetails = domainEntity.encryptedDetails;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;
    return orm;
  }

  async save(goal: Goal, transactionManager?: any): Promise<Goal> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    const ormEntity = this.toOrm(goal);
    const saved = await manager.save(GoalORMEntity, ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string, transactionManager?: any): Promise<Goal | null> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    const ormEntity = await manager.findOne(GoalORMEntity, { where: { id } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findAllByUserId(
    userId: string,
    transactionManager?: any,
  ): Promise<Goal[]> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    const ormEntities = await manager.find(GoalORMEntity, {
      where: { userId },
      order: { createdAt: "DESC" } as any,
    });
    return ormEntities.map((orm) => this.toDomain(orm));
  }

  async delete(id: string, transactionManager?: any): Promise<void> {
    const manager =
      (transactionManager as EntityManager) || this.ormRepository.manager;
    await manager.delete(GoalORMEntity, id);
  }
}
