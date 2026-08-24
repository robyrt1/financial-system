import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  TokenGeneratorPort,
  TokenPayload,
} from '@domain/ports/out/token-generator.port';

const DEFAULT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCPSeT9oWacSpHV
1sdavnabdbQ3OUvV4xSkmA3mtLtG+TCoBtxMjnFArnxNUGBHC+KUXZ4HjxleE1Lf
UciJxEczAyNkKzTgeupsJ85BwHUZfc2h+Boz4xqhXHdIRvqGW2KhWxigkLqqQpzf
BRzTVpoKq43NOrskNwtob12N8QIjgNdCYoFL1Pa0YYgbDlG7M2rT+BicmtuDQB6d
i9rMUba0F1VOdOuPxteJceQDwXAflkFDR6yBH7PRBofdNbx52GrRFPxx15RQz8jK
3UFo84LTYFItGM+UPMa7Fa3GLCWtlXyLInOZlmb+kq0KxKYO+hzcsiHD4+iYVGNb
PxNMaY3ZAgMBAAECggEAQrWs8jYj7wy6k7twSbuVva/RbMp0l4omsLCH/EpVTGg0
cm3rP4srh+kUPux2Pm12mgtxyOQi88z8TrMlMZqbaVEDN53z+rTPEfaATNVczzbm
Nwuqq1CGs+w4LoK5HTdLloKyVwK6nQzxOtWHA490nRYcqRk4SlaELaV3gV9c1wjw
+xKnnrh5ad4KV6QbYvIKFQEShHerqDfrLIvTXpQRkaWfcy5z6BnGtBI47QaAab6m
uprEfYI0ZDD1lJGl6j6fGdPJBPZciILPwOEOwPdCnlWDju7PKL/WFq0iHXwCnHaa
ZYeZK/iq93XvN1K660czZRcnlKzsmj57EBpArwXZ7wKBgQDGj8H7tfa8xup4Tm7a
Q9nv6bPlSib14FdrqbOajBKtoi3dI/ChriTQP9NCWFXJLLK5KVh8jT2vGH7f0oBn
088FBZRnwwBWd1maIDNcac+wq9+/+gQ+FHnH953dg3cKjaM8EyN5k4GlptH4td9J
yN9ubjzcN6fNyJDJPx8qihi9ywKBgQC4vPeIFjagCNBHKk0Bu75W5kNQq8LvxMAj
Gw1xHeN4mI/Qc0Ljy+Es49AIlBidM49+rUe94VwV00Ve9UPaLkca8QU2H1jXkrH0
5M9TnjpW96n4OcxBhtFmAGrW9qLMLTsCYj10A31lJ0y6ciuJ9XbY3ff7fg8yl6hW
4uEbBu9uawKBgQCQo0lfzMXl71P+vMt9DK3lWCyl2mUU+A1WLLDa5Cv69UdJbhOs
AolodQWzr1sWBwxNWrPNTqlfMY3CBrloaF7FvrHC/8XwNlI7tjcTmzQh8qEzW7DZ
c9rd8h65rDj7o/8DFMHjnrJy81jCPeFgAwXWkFCe7Z+7g90L64INX7j0DwKBgEUO
TjFOrGiyIrkXdOW6+nGdbXhQXHQoRfJZgHLSS1+fF9NB4rUoVynilrc+NN0+kts1
huXRwgxeh0XxxMVgGzBU/C+5FAqxSVhT17RYJ1KvDZg+cr3j2Y6ZhVaJp11PYwmH
E5W0YEFZqXLgjqnpWd3DS5l1C9VLn5+q+56Qvxu1AoGBAJ9ag/EKyCld82+2yMsV
I5xmwbLrEIPjVtNsahHdQ7X1d/4o7494yWKkDLLxwQaCdkvmnNp9MyG2Q+DIzV0Q
FYVftMJi1rTDGLt3lgjrlpRJRAZNdMa7rsQcs7KfrjVETvHuNIS5rAbUAFcJyh2c
5TY7vQIl8VGcrha9saTwTy6E
-----END PRIVATE KEY-----`;

@Injectable()
export class JwtGeneratorAdapter implements TokenGeneratorPort {
  private readonly privateKey: string;

  constructor(configService: ConfigService) {
    const configuredKey = configService.get<string>('JWT_PRIVATE_KEY');
    this.privateKey = configuredKey
      ? configuredKey.replace(/\\n/g, '\n')
      : DEFAULT_PRIVATE_KEY;
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      { sub: payload.userId, email: payload.email, roles: payload.roles ?? [] },
      this.privateKey,
      { algorithm: 'RS256', expiresIn: '15m' },
    );
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      { sub: payload.userId, token_family: payload.tokenFamily },
      this.privateKey,
      { algorithm: 'RS256', expiresIn: '7d' },
    );
  }

  generateMfaToken(payload: TokenPayload): string {
    return jwt.sign(
      { sub: payload.userId, email: payload.email, scope: 'mfa_pending' },
      this.privateKey,
      { algorithm: 'RS256', expiresIn: '5m' },
    );
  }
}
