import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { User } from '@domain/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private readonly filePath = path.join(__dirname, 'users-db.json');
  private readonly users = new Map<string, User>();

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const rawUsers = JSON.parse(data);
        for (const raw of rawUsers) {
          const user = new User({
            id: raw.id,
            name: raw.name,
            email: raw.email,
            passwordHash: raw.passwordHash,
            mfaEnabled: raw.mfaEnabled,
            mfaSecret: raw.mfaSecret,
            createdAt: new Date(raw.createdAt),
            updatedAt: new Date(raw.updatedAt),
          });
          this.users.set(user.id, user);
        }
      }
    } catch (error) {
      console.error('Failed to load in-memory database:', error);
    }
  }

  private persistUsers() {
    try {
      const rawUsers = Array.from(this.users.values()).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(rawUsers, null, 2),
        'utf-8',
      );
    } catch (error) {
      console.error('Failed to write in-memory database:', error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
    this.persistUsers();
  }
}
