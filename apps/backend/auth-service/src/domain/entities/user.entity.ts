import { InvalidEmailError, InvalidPasswordLengthError } from '@domain/errors/auth-errors';

export interface UserProps {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    constructor(private readonly props: UserProps) {
        this.validate();
    }

    get id(): string { return this.props.id; }
    get name(): string { return this.props.name; }
    get email(): string { return this.props.email; }
    get passwordHash(): string { return this.props.passwordHash; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    private validate(): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.props.email)) {
            throw new InvalidEmailError(this.props.email);
        }
    }

    static create(name: string, email: string, passwordHash: string, id: string): User {
        if (passwordHash.length === 0) {
            throw new InvalidPasswordLengthError();
        }
        return new User({
            id,
            name,
            email: email.toLowerCase().trim(),
            passwordHash,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}