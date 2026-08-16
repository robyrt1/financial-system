import { BaseDomainError } from '@financial-system/shared-errors';

export class InvalidEmailError extends BaseDomainError {
    readonly code = 'AUTH.INVALID_EMAIL';
    readonly translationKey = 'errors.auth.invalid_email';
    readonly statusCode = 400;

    constructor(email: string) {
        super(`O e-mail '${email}' possui um formato inválido`, { params: { email } });
    }
}

export class InvalidPasswordLengthError extends BaseDomainError {
    readonly code = 'AUTH.INVALID_PASSWORD_LENGTH';
    readonly translationKey = 'errors.auth.invalid_password_length';
    readonly statusCode = 400;

    constructor() {
        super('A senha deve conter no mínimo 8 caracteres');
    }
}

export class UserAlreadyExistsError extends BaseDomainError {
    readonly code = 'AUTH.USER_ALREADY_EXISTS';
    readonly translationKey = 'errors.auth.user_already_exists';
    readonly statusCode = 409;

    constructor(email: string) {
        super(`O usuário com e-mail '${email}' já existe`, { params: { email } });
    }
}

export class InvalidCredentialsError extends BaseDomainError {
    readonly code = 'AUTH.INVALID_CREDENTIALS';
    readonly translationKey = 'errors.auth.invalid_credentials';
    readonly statusCode = 401;

    constructor() {
        super('Credenciais inválidas fornecidas');
    }
}

export class UnauthorizedDirectAccessError extends BaseDomainError {
    readonly code = 'AUTH.DIRECT_ACCESS_FORBIDDEN';
    readonly translationKey = 'errors.auth.direct_access_forbidden';
    readonly statusCode = 403;

    constructor() {
        super('Acesso direto ao microsserviço negado. Utilize o API Gateway.');
    }
}