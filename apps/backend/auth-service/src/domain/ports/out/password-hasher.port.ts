export interface PasswordHasherPort {
    hash(plainText: string): Promise<string>;
    compare(plainText: string, hash: string): Promise<boolean>;
}