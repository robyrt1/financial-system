import { Debt } from "../../entities/debt.entity";

export interface DebtRepositoryPort {
  save(debt: Debt): Promise<Debt>;
  findById(id: string): Promise<Debt | null>;
  findByUserId(userId: string): Promise<Debt[]>;
  findByUserIdAndStatus(userId: string, status: string): Promise<Debt[]>;
  findAllActiveByUserIdOrderByInterestDesc(userId: string): Promise<Debt[]>;
  findAllActiveByUserIdOrderByBalanceAsc(userId: string): Promise<Debt[]>;
}
