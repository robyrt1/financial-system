import { User } from '@domain/entities/user.entity';
import { UserORMEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserORMEntity): User {
    return new User({
      id: orm.id,
      name: orm.name,
      email: orm.email,
      passwordHash: orm.passwordHash,
      mfaEnabled: orm.mfaEnabled,
      mfaSecret: orm.mfaSecret || undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toORM(domain: User): UserORMEntity {
    const orm = new UserORMEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.mfaEnabled = domain.mfaEnabled;
    orm.mfaSecret = domain.mfaSecret || '';
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
