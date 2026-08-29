import { BaseDomainError } from "@financial-system/shared-errors";

export class DebtDomainException extends BaseDomainError {
  public readonly code: string = "FINANCIAL.DEBT.DOMAIN_ERROR";
  public readonly translationKey: string = "errors.financial.debt.domain_error";
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
    this.name = "DebtDomainException";
  }
}

export class DebtNotFoundException extends DebtDomainException {
  constructor(id?: string) {
    super(
      `Debt with id ${id || "unknown"} not found`,
      "FINANCIAL.DEBT.NOT_FOUND",
      "errors.financial.debt.not_found",
      404,
    );
    this.name = "DebtNotFoundException";
  }
}

export class InvalidAmortizationAmountException extends DebtDomainException {
  constructor(message?: string) {
    super(
      message || "Invalid amortization amount",
      "FINANCIAL.DEBT.INVALID_AMORTIZATION",
      "errors.financial.debt.invalid_amortization",
      400,
    );
    this.name = "InvalidAmortizationAmountException";
  }
}

export class DebtAlreadyPaidOffException extends DebtDomainException {
  constructor(id?: string) {
    super(
      `Debt with id ${id || "unknown"} is already paid off`,
      "FINANCIAL.DEBT.ALREADY_PAID",
      "errors.financial.debt.already_paid",
      400,
    );
    this.name = "DebtAlreadyPaidOffException";
  }
}
