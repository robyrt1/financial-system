import { Account } from "../../entities/account.entity";

export interface AccountRepositoryPort {
  findById(id: string, entityManager?: any): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  save(account: Account, entityManager?: any): Promise<void>;
}
