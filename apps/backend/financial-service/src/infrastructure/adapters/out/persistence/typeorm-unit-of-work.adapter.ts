import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";
import { UnitOfWorkPort } from "@domain/ports/out/unit-of-work.port";
import { AsyncLocalStorage } from "async_hooks";

@Injectable()
export class TypeOrmUnitOfWorkAdapter implements UnitOfWorkPort {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<EntityManager>();

  constructor(private readonly dataSource: DataSource) {}

  async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const existingManager =
      TypeOrmUnitOfWorkAdapter.asyncLocalStorage.getStore();
    if (existingManager) {
      return work();
    }

    return this.dataSource.transaction(async (manager) => {
      return TypeOrmUnitOfWorkAdapter.asyncLocalStorage.run(manager, () => {
        return work();
      });
    });
  }

  static getStoreManager(): EntityManager | null {
    return this.asyncLocalStorage.getStore() || null;
  }
}
