import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasherPort } from '@domain/ports/out/password-hasher.port';

@Injectable()
export class BcryptHasherAdapter implements PasswordHasherPort {
    private readonly rounds = 10;

    async hash(plainText: string): Promise<string> {
        return bcrypt.hash(plainText, this.rounds);
    }

    async compare(plainText: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainText, hash);
    }
}