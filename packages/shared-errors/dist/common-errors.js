"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = void 0;
const base_domain_error_js_1 = require("./base-domain-error.js");
class UnauthorizedError extends base_domain_error_js_1.BaseDomainError {
    code = 'AUTH.UNAUTHORIZED';
    translationKey = 'errors.auth.unauthorized';
    statusCode = 401;
    constructor(message = 'NOT_AUTHENTICATED', details) {
        super(message, { details });
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends base_domain_error_js_1.BaseDomainError {
    code = 'AUTH.FORBIDDEN';
    translationKey = 'errors.auth.forbidden';
    statusCode = 403;
    constructor(message = 'NOT_AUTHORIZED', details) {
        super(message, { details });
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends base_domain_error_js_1.BaseDomainError {
    code = 'RESOURCE.NOT_FOUND';
    translationKey = 'errors.resource.not_found';
    statusCode = 404;
    constructor(message = 'RESOURCE_NOT_FOUND', details) {
        super(message, { details });
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends base_domain_error_js_1.BaseDomainError {
    code = 'SYSTEM.INTERNAL_ERROR';
    translationKey = 'errors.system.internal_error';
    statusCode = 500;
    constructor(message = 'INTERNAL_ERROR', details) {
        super(message, { details });
    }
}
exports.InternalServerError = InternalServerError;
