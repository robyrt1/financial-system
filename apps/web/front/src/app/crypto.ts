import { getAccessToken } from "./api";

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    return payload.sub || payload.userId || payload.id || null;
  } catch (err) {
    console.error("Failed to decode token for encryption key:", err);
    return null;
  }
}

async function getEncryptionKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = "rmtech_client_zk_salt_2026";
  const keyData = encoder.encode(userId + salt);
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptLocal(
  text: string,
  userId: string,
): Promise<EncryptedPayload> {
  const key = await getEncryptionKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const dataBytes = cipherBytes.slice(0, -16);
  const authTagBytes = cipherBytes.slice(-16);

  return {
    encryptedData: bufferToHex(dataBytes.buffer),
    iv: bufferToHex(iv.buffer),
    authTag: bufferToHex(authTagBytes.buffer),
  };
}

export async function decryptLocal(
  encryptedData: string,
  iv: string,
  authTag: string,
  userId: string,
): Promise<string> {
  const key = await getEncryptionKey(userId);
  const dataBytes = hexToBytes(encryptedData);
  const ivBytes = hexToBytes(iv);
  const authTagBytes = hexToBytes(authTag);

  const cipherBytes = new Uint8Array(dataBytes.length + authTagBytes.length);
  cipherBytes.set(dataBytes, 0);
  cipherBytes.set(authTagBytes, dataBytes.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes as any, tagLength: 128 },
    key,
    cipherBytes.buffer,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
