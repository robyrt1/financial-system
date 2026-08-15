import { BaseDomainError } from './base-domain-error.js';

export class UnauthorizedError extends BaseDomainError {
    readonly code = 'AUTH.UNAUTHORIZED';
    readonly translationKey = 'errors.auth.unauthorized';
    readonly statusCode = 401;

    constructor(message = 'NOT_AUTHENTICATED', details?: Record<string, unknown>) {
        super(message, { details });
    }
}

export class ForbiddenError extends BaseDomainError {
    readonly code = 'AUTH.FORBIDDEN';
    readonly translationKey = 'errors.auth.forbidden';
    readonly statusCode = 403;

    constructor(message = 'NOT_AUTHORIZED', details?: Record<string, unknown>) {
        super(message, { details });
    }
}

export class NotFoundError extends BaseDomainError {
    readonly code = 'RESOURCE.NOT_FOUND';
    readonly translationKey = 'errors.resource.not_found';
    readonly statusCode = 404;

    constructor(message = 'RESOURCE_NOT_FOUND', details?: Record<string, unknown>) {
        super(message, { details });
    }
}

export class InternalServerError extends BaseDomainError {
    readonly code = 'SYSTEM.INTERNAL_ERROR';
    readonly translationKey = 'errors.system.internal_error';
    readonly statusCode = 500;

    constructor(message = 'INTERNAL_ERROR', details?: Record<string, unknown>) {
        super(message, { details });
    }
}