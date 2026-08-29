import { BaseDomainError } from "@financial-system/shared-errors";

export class GoalDomainException extends BaseDomainError {
  public readonly code: string = "FINANCIAL.GOAL.DOMAIN_ERROR";
  public readonly translationKey: string = "errors.financial.goal.domain_error";
  public readonly statusCode: number = 400;

  constructor(
    message: string,
    code?: string,
    translationKey?: string,
    statusCode?: number,
  ) {
    super(message);
    if (code) this.code = code;
    if (translationKey) this.translationKey = translationKey;
    if (statusCode) this.statusCode = statusCode;
    this.name = "GoalDomainException";
  }
}

export class GoalNotFoundException extends GoalDomainException {
  constructor(id: string) {
    super(
      `Goal with ID ${id} not found.`,
      "FINANCIAL.GOAL.NOT_FOUND",
      "errors.financial.goal.not_found",
      404,
    );
    this.name = "GoalNotFoundException";
  }
}

export class InsufficientFundsException extends GoalDomainException {
  constructor(message = "Saldo insuficiente na conta de origem.") {
    super(
      message,
      "FINANCIAL.GOAL.INSUFFICIENT_FUNDS",
      "errors.financial.goal.insufficient_funds",
      400,
    );
    this.name = "InsufficientFundsException";
  }
}

export class GoalAlreadyCompletedException extends GoalDomainException {
  constructor(
    message = "Esta meta já atingiu 100% ou mais do seu valor alvo.",
  ) {
    super(
      message,
      "FINANCIAL.GOAL.ALREADY_COMPLETED",
      "errors.financial.goal.already_completed",
      400,
    );
    this.name = "GoalAlreadyCompletedException";
  }
}
