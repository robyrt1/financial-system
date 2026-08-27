import { Transaction } from "@domain/entities/transaction.entity";
import { TransactionORMEntity } from "../entities/transaction.orm-entity";

export class TransactionMapper {
  static toDomain(orm: TransactionORMEntity): Transaction {
    return new Transaction({
      id: orm.id,
      userId: orm.userId,
      accountId: orm.accountId,
      categoryId: orm.categoryId,
      destinationAccountId: orm.destinationAccountId,
      description: orm.description,
      amount: Number(orm.amount),
      type: orm.type as any,
      status: orm.status as any,
      date: orm.date,
      tags: orm.tags || [],
      encryptedDetails: orm.encryptedDetails,
      paymentMethod: orm.paymentMethod as any,
      creditCardId: orm.creditCardId,
      installments: orm.installments,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toORM(domain: Transaction): TransactionORMEntity {
    const orm = new TransactionORMEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.accountId = domain.accountId;
    orm.categoryId = domain.categoryId;
    orm.destinationAccountId = domain.destinationAccountId;
    orm.description = domain.description;
    orm.amount = domain.amount;
    orm.type = domain.type;
    orm.status = domain.status;
    orm.date = domain.date;
    orm.tags = domain.tags;
    orm.encryptedDetails = domain.encryptedDetails;
    orm.paymentMethod = domain.paymentMethod;
    orm.creditCardId = domain.creditCardId;
    orm.installments = domain.installments;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
