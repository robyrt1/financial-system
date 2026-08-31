import { BaseDomainError } from "@financial-system/shared-errors";
import { NotificationErrorDetail } from "./notification";

export class NotificationError extends BaseDomainError {
  public readonly code = "FINANCIAL.VALIDATION_ERROR";
  public readonly translationKey = "errors.financial.validation_error";
  public readonly statusCode = 400;

  constructor(errors: NotificationErrorDetail[]) {
    super("Validation errors occurred", {
      details: { errors },
    });
    this.name = "NotificationError";
  }
}
