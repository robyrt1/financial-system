import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { User } from '@domain/entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
    private readonly users = new Map<string, User>();

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
    }
}