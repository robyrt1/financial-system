import { CreditCard } from "../../entities/credit-card.entity";

export interface CreditCardRepositoryPort {
  findById(id: string, entityManager?: any): Promise<CreditCard | null>;
  findByUserId(userId: string): Promise<CreditCard[]>;
  save(card: CreditCard, entityManager?: any): Promise<void>;
}
