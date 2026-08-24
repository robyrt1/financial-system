import { TokenPayload } from './token-generator.port';

export interface TokenVerifierPort {
  verify(token: string): TokenPayload & { scope?: string };
}
