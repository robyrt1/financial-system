import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import { TokenPayload } from '@domain/ports/out/token-generator.port';

const DEFAULT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj0nk/aFmnEqR1dbHWr52
m3W0NzlL1eMUpJgN5rS7RvkwqAbcTI5xQK58TVBgRwvilF2eB48ZXhNS31HIicRH
MwMjZCs04HrqbCfOQcB1GX3NofgaM+MaoVx3SEb6hltioVsYoJC6qkKc3wUc01aa
CquNzTq7JDcLaG9djfECI4DXQmKBS9T2tGGIGw5RuzNq0/gYnJrbg0AenYvazFG2
tBdVTnTrj8bXiXHkA8FwH5ZBQ0esgR+z0QaH3TW8edhq0RT8cdeUUM/Iyt1BaPOC
02BSLRjPlDzGuxWtxiwlrZV8iyJzmZZm/pKtCsSmDvoc3LIhw+PomFRjWz8TTGmN
2QIDAQAB
-----END PUBLIC KEY-----`;

@Injectable()
export class JwtVerifierAdapter implements TokenVerifierPort {
  private readonly publicKey: string;

  constructor(configService: ConfigService) {
    const configuredKey = configService.get<string>('JWT_PUBLIC_KEY');
    this.publicKey = configuredKey
      ? configuredKey.replace(/\\n/g, '\n')
      : DEFAULT_PUBLIC_KEY;
  }

  verify(token: string): TokenPayload & { scope?: string } {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as jwt.JwtPayload & { scope?: string; token_family?: string };
      return {
        userId: decoded.sub || '',
        email: decoded.email || '',
        roles: decoded.roles || [],
        scope: decoded.scope,
        tokenFamily: decoded.token_family,
      };
    } catch {
      throw new Error('Invalid token signature or expired token');
    }
  }
}
