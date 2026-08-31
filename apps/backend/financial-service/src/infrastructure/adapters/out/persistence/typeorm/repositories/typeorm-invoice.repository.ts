import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InvoiceRepositoryPort } from "@domain/ports/out/invoice-repository.port";
import { Invoice } from "@domain/entities/invoice.entity";
import { InvoiceORMEntity } from "../entities/invoice.orm-entity";
import { InvoiceMapper } from "../mappers/invoice.mapper";
import { TypeOrmUnitOfWorkAdapter } from "../../typeorm-unit-of-work.adapter";

@Injectable()
export class TypeOrmInvoiceRepository implements InvoiceRepositoryPort {
  constructor(
    @InjectRepository(InvoiceORMEntity)
    private readonly repository: Repository<InvoiceORMEntity>,
  ) {}

  private getRepository(entityManager?: any): Repository<InvoiceORMEntity> {
    const manager = entityManager || TypeOrmUnitOfWorkAdapter.getStoreManager();
    return manager ? manager.getRepository(InvoiceORMEntity) : this.repository;
  }

  async findById(id: string, entityManager?: any): Promise<Invoice | null> {
    const repo = this.getRepository(entityManager);
    const orm = await repo.findOne({ where: { id } });
    return orm ? InvoiceMapper.toDomain(orm) : null;
  }

  async findByCardId(creditCardId: string): Promise<Invoice[]> {
    const repo = this.getRepository();
    const orms = await repo.find({ where: { creditCardId } });
    return orms.map((orm) => InvoiceMapper.toDomain(orm));
  }

  async findCurrentInvoice(
    creditCardId: string,
    month: number,
    year: number,
    entityManager?: any,
  ): Promise<Invoice | null> {
    const repo = this.getRepository(entityManager);
    const orm = await repo.findOne({ where: { creditCardId, month, year } });
    return orm ? InvoiceMapper.toDomain(orm) : null;
  }

  async save(invoice: Invoice, entityManager?: any): Promise<void> {
    const repo = this.getRepository(entityManager);
    const orm = InvoiceMapper.toORM(invoice);
    await repo.save(orm);
  }
}
