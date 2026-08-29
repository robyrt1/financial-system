import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";
import { Transaction } from "@domain/entities/transaction.entity";
import { FilterTransactionsQuery } from "@domain/ports/in/list-transactions.port";
import { TransactionORMEntity } from "../entities/transaction.orm-entity";
import { TransactionMapper } from "../mappers/transaction.mapper";

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionORMEntity)
    private readonly repository: Repository<TransactionORMEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? TransactionMapper.toDomain(orm) : null;
  }

  async save(transaction: Transaction, entityManager?: any): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(TransactionORMEntity)
      : this.repository;
    const orm = TransactionMapper.toORM(transaction);
    await repo.save(orm);
  }

  async delete(id: string, entityManager?: any): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(TransactionORMEntity)
      : this.repository;
    await repo.delete(id);
  }

  async findAll(
    userId: string,
    query: FilterTransactionsQuery,
  ): Promise<{ data: Transaction[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder("t")
      .where("t.userId = :userId", { userId });

    if (query.search) {
      qb.andWhere("t.description ILIKE :search", {
        search: `%${query.search}%`,
      });
    }
    if (query.accountId) {
      qb.andWhere("t.accountId = :accountId", { accountId: query.accountId });
    }
    if (query.categoryId) {
      qb.andWhere("t.categoryId = :categoryId", {
        categoryId: query.categoryId,
      });
    }
    if (query.status) {
      qb.andWhere("t.status = :status", { status: query.status });
    }
    if (query.type) {
      qb.andWhere("t.type = :type", { type: query.type });
    }
    if (query.startDate) {
      qb.andWhere("t.date >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("t.date <= :endDate", { endDate: query.endDate });
    }

    qb.orderBy("t.date", "DESC").addOrderBy("t.createdAt", "DESC");

    const total = await qb.getCount();

    if (query.page && query.limit) {
      const skip = (query.page - 1) * query.limit;
      qb.skip(skip).take(query.limit);
    }

    const orms = await qb.getMany();
    const data = orms.map((orm) => TransactionMapper.toDomain(orm));

    return { data, total };
  }

  async findAllWithoutPagination(
    userId: string,
    query: Omit<FilterTransactionsQuery, "page" | "limit">,
  ): Promise<Transaction[]> {
    const qb = this.repository
      .createQueryBuilder("t")
      .where("t.userId = :userId", { userId });

    if (query.search) {
      qb.andWhere("t.description ILIKE :search", {
        search: `%${query.search}%`,
      });
    }
    if (query.accountId) {
      qb.andWhere("t.accountId = :accountId", { accountId: query.accountId });
    }
    if (query.categoryId) {
      qb.andWhere("t.categoryId = :categoryId", {
        categoryId: query.categoryId,
      });
    }
    if (query.status) {
      qb.andWhere("t.status = :status", { status: query.status });
    }
    if (query.type) {
      qb.andWhere("t.type = :type", { type: query.type });
    }
    if (query.startDate) {
      qb.andWhere("t.date >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("t.date <= :endDate", { endDate: query.endDate });
    }

    qb.orderBy("t.date", "DESC");

    const orms = await qb.getMany();
    return orms.map((orm) => TransactionMapper.toDomain(orm));
  }

  async getSummaryMetrics(
    userId: string,
    query: Omit<FilterTransactionsQuery, "page" | "limit">,
  ): Promise<{ totalIncomes: number; totalExpenses: number }> {
    const qb = this.repository
      .createQueryBuilder("t")
      .select(
        "SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END)",
        "totalIncomes",
      )
      .addSelect(
        "SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END)",
        "totalExpenses",
      )
      .where("t.userId = :userId", { userId });

    if (query.search) {
      qb.andWhere("t.description ILIKE :search", {
        search: `%${query.search}%`,
      });
    }
    if (query.accountId) {
      qb.andWhere("t.accountId = :accountId", { accountId: query.accountId });
    }
    if (query.categoryId) {
      qb.andWhere("t.categoryId = :categoryId", {
        categoryId: query.categoryId,
      });
    }
    if (query.status) {
      qb.andWhere("t.status = :status", { status: query.status });
    }
    if (query.type) {
      qb.andWhere("t.type = :type", { type: query.type });
    }
    if (query.startDate) {
      qb.andWhere("t.date >= :startDate", { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere("t.date <= :endDate", { endDate: query.endDate });
    }

    const raw = await qb.getRawOne();
    return {
      totalIncomes: Number(raw?.totalIncomes || 0),
      totalExpenses: Number(raw?.totalExpenses || 0),
    };
  }

  async getMonthlyCashFlow(
    userId: string,
    year: number,
  ): Promise<{ month: string; income: number; expense: number }[]> {
    const raw = await this.repository
      .createQueryBuilder("t")
      .select([
        "TO_CHAR(CAST(t.date AS DATE), 'MM') as month",
        "SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) as income",
        "SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) as expense",
      ])
      .where("t.userId = :userId", { userId })
      .andWhere("EXTRACT(YEAR FROM CAST(t.date AS DATE)) = :year", { year })
      .andWhere("t.status = 'SETTLED'")
      .groupBy("TO_CHAR(CAST(t.date AS DATE), 'MM')")
      .orderBy("month", "ASC")
      .getRawMany();

    return raw.map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
    }));
  }

  async getCategoryDistribution(
    userId: string,
    month: number,
    year: number,
  ): Promise<{ categoryId: string; name: string; amount: number }[]> {
    const raw = await this.repository
      .createQueryBuilder("t")
      .select([
        "t.categoryId as categoryId",
        "c.name as name",
        "SUM(t.amount) as amount",
      ])
      .innerJoin("categories", "c", "c.id = t.categoryId")
      .where("t.userId = :userId", { userId })
      .andWhere("EXTRACT(YEAR FROM CAST(t.date AS DATE)) = :year", { year })
      .andWhere("EXTRACT(MONTH FROM CAST(t.date AS DATE)) = :month", { month })
      .andWhere("t.type = 'EXPENSE'")
      .andWhere("t.status = 'SETTLED'")
      .groupBy("t.categoryId")
      .addGroupBy("c.name")
      .orderBy("amount", "DESC")
      .getRawMany();

    return raw.map((r) => ({
      categoryId: r.categoryid || r.categoryId,
      name: r.name || r.categoryname || "",
      amount: Number(r.amount),
    }));
  }
}
