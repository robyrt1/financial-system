export interface DomainErrorPayload {
    code: string;
    translationKey: string;
    params?: Record<string, unknown>;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
}

export abstract class BaseDomainError extends Error {
    public abstract readonly code: string;
    public abstract readonly translationKey: string;
    public abstract readonly statusCode: number;
    public readonly params?: Record<string, unknown>;
    public readonly details?: Record<string, unknown>;

    constructor(
        message: string,
        options?: {
            params?: Record<string, unknown>;
            details?: Record<string, unknown>;
        }
    ) {
        super(message);
        this.name = this.constructor.name;
        this.params = options?.params;
        this.details = options?.details;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): DomainErrorPayload {
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