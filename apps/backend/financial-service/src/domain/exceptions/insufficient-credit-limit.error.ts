import { BaseDomainError } from "@financial-system/shared-errors";

export class InsufficientCreditLimitError extends BaseDomainError {
  public readonly code = "FINANCIAL.CREDIT_CARD.INSUFFICIENT_LIMIT";
  public readonly translationKey =
    "errors.financial.credit_card.insufficient_limit";
  public readonly statusCode = 400;

  constructor(cardId: string, required: number, available: number) {
    super(
      `Credit card ${cardId} has insufficient limit. Required: ${required}, Available: ${available}`,
      {
        params: { cardId, required, available },
      },
    );
    this.name = "InsufficientCreditLimitError";
  }
}
