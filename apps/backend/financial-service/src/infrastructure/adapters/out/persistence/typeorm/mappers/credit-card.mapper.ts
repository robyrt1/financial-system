import { CreditCard } from "@domain/entities/credit-card.entity";
import { CreditCardORMEntity } from "../entities/credit-card.orm-entity";

export class CreditCardMapper {
  static toDomain(orm: CreditCardORMEntity): CreditCard {
    return new CreditCard({
      id: orm.id,
      userId: orm.userId,
      accountId: orm.accountId,
      cardName: orm.cardName,
      maskedDigits: orm.maskedDigits,
      creditLimit: Number(orm.creditLimit),
      availableLimit: Number(orm.availableLimit),
      closingDay: orm.closingDay,
      dueDay: orm.dueDay,
      encryptedPayload: orm.encryptedPayload,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toORM(domain: CreditCard): CreditCardORMEntity {
    const orm = new CreditCardORMEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.accountId = domain.accountId;
    orm.cardName = domain.cardName;
    orm.maskedDigits = domain.maskedDigits;
    orm.creditLimit = domain.creditLimit;
    orm.availableLimit = domain.availableLimit;
    orm.closingDay = domain.closingDay;
    orm.dueDay = domain.dueDay;
    orm.encryptedPayload = domain.encryptedPayload;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
