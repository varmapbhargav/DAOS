import { Email, RoleId, TenantId, UserId } from '@daos/shared-kernel';

import { User } from '../aggregates/user.aggregate';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(tenantId: TenantId, id: UserId): Promise<User | null>;
  findByEmail(tenantId: TenantId, email: Email): Promise<User | null>;
  findAll(tenantId: TenantId): Promise<User[]>;
  countActiveWithRole(tenantId: TenantId, roleId: RoleId): Promise<number>;
}
