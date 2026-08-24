import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { User } from '@domain/entities/user.entity';
import { UserORMEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserORMEntity)
    private readonly repository: Repository<UserORMEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const ormUser = await this.repository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const ormUser = await this.repository.findOne({ where: { id } });
    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  async save(user: User): Promise<void> {
    const ormUser = UserMapper.toORM(user);
    await this.repository.save(ormUser);
  }
}
