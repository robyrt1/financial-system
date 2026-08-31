export interface NotificationErrorDetail {
  field: string;
  message: string;
}

export class Notification {
  private readonly errors: NotificationErrorDetail[] = [];

  addError(error: NotificationErrorDetail): void {
    this.errors.push(error);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): NotificationErrorDetail[] {
    return this.errors;
  }

  errorMessage(): string {
    return this.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
  }
}
