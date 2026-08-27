export class DebtNotFoundException extends Error {
  constructor(id?: string) {
    super(`Debt with id ${id || "unknown"} not found`);
    this.name = "DebtNotFoundException";
  }
}

export class InvalidAmortizationAmountException extends Error {
  constructor(message?: string) {
    super(message || "Invalid amortization amount");
    this.name = "InvalidAmortizationAmountException";
  }
}

export class DebtAlreadyPaidOffException extends Error {
  constructor(id?: string) {
    super(`Debt with id ${id || "unknown"} is already paid off`);
    this.name = "DebtAlreadyPaidOffException";
  }
}
