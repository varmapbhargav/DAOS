import { Email, RoleId, TenantId, UserId } from '@daos/shared-kernel';

import { User } from '../../../domain/aggregates/user.aggregate';
import { UserStatus } from '../../../domain/value-objects/status';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(e: UserOrmEntity): User {
    return User.reconstruct({
      id: UserId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      email: Email.create(e.email),
      status: e.status as UserStatus,
      passwordHash: e.passwordHash,
      roleIds: (e.roleIds as string[]).map((r) => RoleId.create(r)),
      version: e.version,
    });
  }

  static toOrm(domain: User): UserOrmEntity {
    const e = new UserOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.email = domain.email.value;
    e.status = domain.status;
    e.passwordHash = domain.passwordHash;
    e.roleIds = domain.roleIds.map((r) => r.value);
    e.version = domain.version;
    return e;
  }
}
