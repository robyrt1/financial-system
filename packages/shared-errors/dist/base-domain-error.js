"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomainError = void 0;
class BaseDomainError extends Error {
    params;
    details;
    constructor(message, options) {
        super(message);
        this.name = this.constructor.name;
        this.params = options?.params;
        this.details = options?.details;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            code: this.code,
            translationKey: this.translationKey,
            params: this.params,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
        };
    }
}
exports.BaseDomainError = BaseDomainError;
