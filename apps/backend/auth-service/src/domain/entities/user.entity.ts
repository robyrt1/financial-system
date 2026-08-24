import {
  InvalidEmailError,
  InvalidPasswordLengthError,
} from '@domain/errors/auth-errors';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {
    this.validate();
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get mfaEnabled(): boolean {
    return this.props.mfaEnabled ?? false;
  }
  get mfaSecret(): string | undefined {
    return this.props.mfaSecret;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  enableMfa(secret: string): void {
    this.props.mfaEnabled = true;
    this.props.mfaSecret = secret;
    this.props.updatedAt = new Date();
  }

  disableMfa(): void {
    this.props.mfaEnabled = false;
    this.props.mfaSecret = undefined;
    this.props.updatedAt = new Date();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.props.email)) {
      throw new InvalidEmailError(this.props.email);
    }
  }

  static create(
    name: string,
    email: string,
    passwordHash: string,
    id: string,
  ): User {
    if (passwordHash.length === 0) {
      throw new InvalidPasswordLengthError();
    }
    return new User({
      id,
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
