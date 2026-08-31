export const UNIT_OF_WORK = Symbol("UNIT_OF_WORK");

export interface UnitOfWorkPort {
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
