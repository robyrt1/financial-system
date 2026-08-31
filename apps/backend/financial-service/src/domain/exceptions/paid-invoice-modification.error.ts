import { BaseDomainError } from "@financial-system/shared-errors";

export class PaidInvoiceModificationError extends BaseDomainError {
  public readonly code = "FINANCIAL.INVOICE.PAID_MODIFICATION_DENIED";
  public readonly translationKey =
    "errors.financial.invoice.paid_modification_denied";
  public readonly statusCode = 400;

  constructor(
    message = "Cannot modify or delete transactions belonging to a paid invoice",
  ) {
    super(message);
    this.name = "PaidInvoiceModificationError";
  }
}
