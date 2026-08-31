import { BaseDomainError } from "@financial-system/shared-errors";

export class CreditCardNotFoundError extends BaseDomainError {
  public readonly code = "FINANCIAL.CREDIT_CARD.NOT_FOUND";
  public readonly translationKey = "errors.financial.credit_card.not_found";
  public readonly statusCode = 404;

  constructor(id: string) {
    super(`Credit card with id ${id} not found`, {
      params: { id },
    });
    this.name = "CreditCardNotFoundError";
  }
}
