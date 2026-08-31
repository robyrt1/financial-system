import { BaseDomainError } from "@financial-system/shared-errors";

export class CategoryDomainException extends BaseDomainError {
  public readonly code: string = "FINANCIAL.CATEGORY.DOMAIN_ERROR";
  public readonly translationKey: string =
    "errors.financial.category.domain_error";
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
    this.name = "CategoryDomainException";
  }
}

export class CategoryNotFoundException extends CategoryDomainException {
  constructor(id: string) {
    super(
      `Category with id ${id} not found`,
      "FINANCIAL.CATEGORY.NOT_FOUND",
      "errors.financial.category.not_found",
      404,
    );
    this.name = "CategoryNotFoundException";
  }
}

export class SystemCategoryCannotBeDeletedException extends CategoryDomainException {
  constructor(id: string) {
    super(
      `System category with id ${id} cannot be deleted`,
      "FINANCIAL.CATEGORY.SYSTEM_CANNOT_BE_DELETED",
      "errors.financial.category.system_cannot_be_deleted",
      400,
    );
    this.name = "SystemCategoryCannotBeDeletedException";
  }
}

export class SystemCategoryCannotBeModifiedException extends CategoryDomainException {
  constructor(id: string) {
    super(
      `System category with id ${id} cannot have its core properties modified`,
      "FINANCIAL.CATEGORY.SYSTEM_CANNOT_BE_MODIFIED",
      "errors.financial.category.system_cannot_be_modified",
      400,
    );
    this.name = "SystemCategoryCannotBeModifiedException";
  }
}

export class InvalidCategoryTypeException extends CategoryDomainException {
  constructor(type: string) {
    super(
      `Invalid category type: ${type}`,
      "FINANCIAL.CATEGORY.INVALID_TYPE",
      "errors.financial.category.invalid_type",
      400,
    );
    this.name = "InvalidCategoryTypeException";
  }
}

export class SubcategoryNotFoundException extends CategoryDomainException {
  constructor(id: string) {
    super(
      `Subcategory with id ${id} not found`,
      "FINANCIAL.SUBCATEGORY.NOT_FOUND",
      "errors.financial.subcategory.not_found",
      404,
    );
    this.name = "SubcategoryNotFoundException";
  }
}
