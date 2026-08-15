import { UserSession } from '@domain/entities/user-session.entity';

export interface TokenVerifierPort {
  verify(token: string): Promise<UserSession>;
}
export const TOKEN_VERIFIER_PORT = Symbol('TokenVerifierPort');
