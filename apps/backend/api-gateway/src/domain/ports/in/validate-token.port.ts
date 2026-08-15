import { UserSession } from '@domain/entities/user-session.entity.js';

export interface ValidateTokenPort {
    execute(authHeader?: string): Promise<UserSession>;
}
