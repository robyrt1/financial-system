import * as crypto from 'crypto';

export class Totp {
  /**
   * Decodes a base32 string into a Buffer.
   */
  private static base32Decode(base32: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const clean = base32.replace(/=+$/, '').toUpperCase();
    const length = clean.length;
    const buffer = Buffer.alloc(Math.floor((length * 5) / 8));

    let bufferIndex = 0;
    let byte = 0;
    let bits = 0;

    for (let i = 0; i < length; i++) {
      const char = clean[i];
      if (char === undefined) continue;
      const val = alphabet.indexOf(char);
      if (val === -1) {
        throw new Error('Invalid base32 character');
      }

      byte = (byte << 5) | val;
      bits += 5;

      if (bits >= 8) {
        buffer[bufferIndex++] = (byte >> (bits - 8)) & 0xff;
        bits -= 8;
        byte &= (1 << bits) - 1;
      }
    }
    return buffer;
  }

  /**
   * Generates a 6-digit HOTP for a given counter.
   */
  private static generateHOTP(secretBuffer: Buffer, counter: number): string {
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(0, 0);
    counterBuffer.writeUInt32BE(counter, 4);

    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();

    const lastByte = hmacResult[hmacResult.length - 1];
    if (lastByte === undefined) {
      throw new Error('HMAC empty');
    }
    const offset = lastByte & 0xf;

    const b1 = hmacResult[offset];
    const b2 = hmacResult[offset + 1];
    const b3 = hmacResult[offset + 2];
    const b4 = hmacResult[offset + 3];

    if (
      b1 === undefined ||
      b2 === undefined ||
      b3 === undefined ||
      b4 === undefined
    ) {
      throw new Error('HMAC dynamic truncation failed');
    }

    const binary =
      ((b1 & 0x7f) << 24) |
      ((b2 & 0xff) << 16) |
      ((b3 & 0xff) << 8) |
      (b4 & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Generates a random base32 string to use as TOTP secret.
   */
  static generateSecret(length = 20): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const randomBytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      const byte = randomBytes[i];
      if (byte === undefined) continue;
      const char = alphabet[byte % alphabet.length];
      if (char !== undefined) {
        result += char;
      }
    }
    return result;
  }

  /**
   * Verifies a 6-digit TOTP token against a base32 secret.
   * Allows a drift window of +/- 1 (30 seconds).
   */
  static verify(secret: string, token: string, window = 1): boolean {
    try {
      const secretBuffer = this.base32Decode(secret);
      const counter = Math.floor(Date.now() / 1000 / 30);

      for (let i = -window; i <= window; i++) {
        if (this.generateHOTP(secretBuffer, counter + i) === token) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }
}
