import { User } from '@domain/entities/user.entity';

export interface UserRepositoryPort {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}