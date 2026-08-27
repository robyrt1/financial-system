import * as crypto from "crypto";

export class CryptoHelper {
  private readonly algorithm = "aes-256-gcm";
  private readonly key: Buffer;

  constructor(keyString: string) {
    this.key = crypto.createHash("sha256").update(keyString).digest();
  }

  encrypt(text: string): {
    encryptedData: string;
    iv: string;
    authTag: string;
  } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return {
      encryptedData: encrypted,
      iv: iv.toString("hex"),
      authTag: authTag,
    };
  }

  decrypt(encryptedData: string, ivHex: string, authTagHex: string): string {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
