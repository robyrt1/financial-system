import { randomUUID } from "crypto";
import { Account } from "@domain/entities/account.entity";
import {
  ManageAccountPort,
  CreateAccountInput,
} from "@domain/ports/in/manage-account.port";
import { AccountRepositoryPort } from "@domain/ports/out/account-repository.port";
import { EventPublisherPort } from "@domain/ports/out/event-publisher.port";

export class ManageAccountUseCase implements ManageAccountPort {
  constructor(
    private readonly accountRepository: AccountRepositoryPort,
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const account = new Account({
      id: randomUUID(),
      userId: input.userId,
      name: input.name,
      type: input.type,
      balance: 0,
      currency: "BRL",
      syncStatus: "SYNCED",
      encryptedDetails: input.encryptedDetails,
    });

    await this.accountRepository.save(account);

    await this.eventPublisher.publish("account-created", {
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
    });

    return account;
  }

  async listAccounts(userId: string): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }
}
