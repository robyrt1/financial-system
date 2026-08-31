import { BaseDomainError } from "@financial-system/shared-errors";

export class AccountNotFoundError extends BaseDomainError {
  public readonly code = "FINANCIAL.ACCOUNT.NOT_FOUND";
  public readonly translationKey = "errors.financial.account.not_found";
  public readonly statusCode = 404;

  constructor(id: string) {
    super(`Account with id ${id} not found`, {
      params: { id },
    });
    this.name = "AccountNotFoundError";
  }
}
