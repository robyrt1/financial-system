import {
  Account,
  AccountType,
  SyncStatus,
} from "@domain/entities/account.entity";
import { AccountORMEntity } from "../entities/account.orm-entity";

export class AccountMapper {
  static toDomain(orm: AccountORMEntity): Account {
    return new Account({
      id: orm.id,
      userId: orm.userId,
      name: orm.name,
      type: orm.type as AccountType,
      balance: Number(orm.balance),
      currency: orm.currency,
      syncStatus: orm.syncStatus as SyncStatus,
      encryptedDetails: orm.encryptedDetails,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toORM(domain: Account): AccountORMEntity {
    const orm = new AccountORMEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.name = domain.name;
    orm.type = domain.type;
    orm.balance = domain.balance;
    orm.currency = domain.currency;
    orm.syncStatus = domain.syncStatus;
    orm.encryptedDetails = domain.encryptedDetails;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
