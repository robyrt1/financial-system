import { UserSession } from '@domain/entities/user-session.entity';

export interface ValidateTokenPort {
    execute(authHeader?: string): Promise<UserSession>;
}
