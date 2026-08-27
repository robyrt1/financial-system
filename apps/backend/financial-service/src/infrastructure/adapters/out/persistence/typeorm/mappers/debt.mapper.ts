import {
  Debt,
  DebtType,
  DebtStatus,
} from "../../../../../../domain/entities/debt.entity";
import { DebtORMEntity } from "../entities/debt.orm-entity";

export class DebtMapper {
  static toDomain(ormEntity: DebtORMEntity): Debt {
    return new Debt({
      id: ormEntity.id,
      userId: ormEntity.userId,
      creditorName: ormEntity.creditorName,
      type: ormEntity.type as DebtType,
      originalAmount: Number(ormEntity.originalAmount),
      remainingBalance: Number(ormEntity.remainingBalance),
      totalInstallments: ormEntity.totalInstallments,
      paidInstallments: ormEntity.paidInstallments,
      monthlyPayment: Number(ormEntity.monthlyPayment),
      monthlyInterestRate: Number(ormEntity.monthlyInterestRate),
      dueDay: ormEntity.dueDay || undefined,
      encryptedContractData: ormEntity.encryptedContractData || undefined,
      status: ormEntity.status as DebtStatus,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toORM(domainEntity: Debt): DebtORMEntity {
    const orm = new DebtORMEntity();
    if (domainEntity.id) {
      orm.id = domainEntity.id;
    }
    orm.userId = domainEntity.userId;
    orm.creditorName = domainEntity.creditorName;
    orm.type = domainEntity.type;
    orm.originalAmount = domainEntity.originalAmount;
    orm.remainingBalance = domainEntity.remainingBalance;
    orm.totalInstallments = domainEntity.totalInstallments;
    orm.paidInstallments = domainEntity.paidInstallments;
    orm.monthlyPayment = domainEntity.monthlyPayment;
    orm.monthlyInterestRate = domainEntity.monthlyInterestRate;
    orm.dueDay = domainEntity.dueDay || null;
    orm.encryptedContractData = domainEntity.encryptedContractData || null;
    orm.status = domainEntity.status;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;

    return orm;
  }
}
