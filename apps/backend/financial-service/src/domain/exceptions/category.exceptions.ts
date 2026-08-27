export class CategoryDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryDomainException";
  }
}

export class CategoryNotFoundException extends CategoryDomainException {
  constructor(id: string) {
    super(`Category with id ${id} not found`);
    this.name = "CategoryNotFoundException";
  }
}

export class SystemCategoryCannotBeDeletedException extends CategoryDomainException {
  constructor(id: string) {
    super(`System category with id ${id} cannot be deleted`);
    this.name = "SystemCategoryCannotBeDeletedException";
  }
}

export class SystemCategoryCannotBeModifiedException extends CategoryDomainException {
  constructor(id: string) {
    super(
      `System category with id ${id} cannot have its core properties modified`,
    );
    this.name = "SystemCategoryCannotBeModifiedException";
  }
}

export class InvalidCategoryTypeException extends CategoryDomainException {
  constructor(type: string) {
    super(`Invalid category type: ${type}`);
    this.name = "InvalidCategoryTypeException";
  }
}
