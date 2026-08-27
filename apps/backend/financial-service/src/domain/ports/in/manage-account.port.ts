import { Account, AccountType } from "../../entities/account.entity";

export interface CreateAccountInput {
  userId: string;
  name: string;
  type: AccountType;
  encryptedDetails: {
    encryptedData: string;
    iv: string;
    authTag: string;
  };
}

export interface ManageAccountPort {
  createAccount(input: CreateAccountInput): Promise<Account>;
  listAccounts(userId: string): Promise<Account[]>;
}
