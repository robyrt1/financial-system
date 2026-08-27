import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { Invoice } from "@domain/entities/invoice.entity";
import { InvoiceORMEntity } from "../entities/invoice.orm-entity";
import { InvoiceMapper } from "../mappers/invoice.mapper";

@Injectable()
export class TypeOrmInvoiceRepository implements InvoiceRepositoryPort {
  constructor(
    @InjectRepository(InvoiceORMEntity)
    private readonly repository: Repository<InvoiceORMEntity>,
  ) {}

  async findById(id: string, entityManager?: any): Promise<Invoice | null> {
    const repo = entityManager
      ? entityManager.getRepository(InvoiceORMEntity)
      : this.repository;
    const orm = await repo.findOne({ where: { id } });
    return orm ? InvoiceMapper.toDomain(orm) : null;
  }

  async findByCardId(creditCardId: string): Promise<Invoice[]> {
    const orms = await this.repository.find({ where: { creditCardId } });
    return orms.map((orm) => InvoiceMapper.toDomain(orm));
  }

  async findCurrentInvoice(
    creditCardId: string,
    month: number,
    year: number,
    entityManager?: any,
  ): Promise<Invoice | null> {
    const repo = entityManager
      ? entityManager.getRepository(InvoiceORMEntity)
      : this.repository;
    const orm = await repo.findOne({ where: { creditCardId, month, year } });
    return orm ? InvoiceMapper.toDomain(orm) : null;
  }

  async save(invoice: Invoice, entityManager?: any): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(InvoiceORMEntity)
      : this.repository;
    const orm = InvoiceMapper.toORM(invoice);
    await repo.save(orm);
  }
}
