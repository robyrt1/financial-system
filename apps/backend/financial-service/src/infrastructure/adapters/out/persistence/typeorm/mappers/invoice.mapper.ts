import { Invoice, InvoiceStatus } from "@domain/entities/invoice.entity";
import { InvoiceORMEntity } from "../entities/invoice.orm-entity";

export class InvoiceMapper {
  static toDomain(orm: InvoiceORMEntity): Invoice {
    return new Invoice({
      id: orm.id,
      creditCardId: orm.creditCardId,
      month: orm.month,
      year: orm.year,
      totalAmount: Number(orm.totalAmount),
      status: orm.status as InvoiceStatus,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toORM(domain: Invoice): InvoiceORMEntity {
    const orm = new InvoiceORMEntity();
    orm.id = domain.id;
    orm.creditCardId = domain.creditCardId;
    orm.month = domain.month;
    orm.year = domain.year;
    orm.totalAmount = domain.totalAmount;
    orm.status = domain.status;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
