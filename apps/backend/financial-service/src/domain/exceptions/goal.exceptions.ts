export class GoalNotFoundException extends Error {
  constructor(id: string) {
    super(`Goal with ID ${id} not found.`);
    this.name = "GoalNotFoundException";
  }
}

export class InsufficientFundsException extends Error {
  constructor(message = "Saldo insuficiente na conta de origem.") {
    super(message);
    this.name = "InsufficientFundsException";
  }
}

export class GoalAlreadyCompletedException extends Error {
  constructor(
    message = "Esta meta já atingiu 100% ou mais do seu valor alvo.",
  ) {
    super(message);
    this.name = "GoalAlreadyCompletedException";
  }
}
