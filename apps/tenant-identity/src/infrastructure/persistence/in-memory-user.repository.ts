import { Email, RoleId, TenantId, UserId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

import { User } from '../../domain/aggregates/user.aggregate';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserStatus } from '../../domain/value-objects/status';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.store.set(user.id.value, user);
  }

  async findById(tenantId: TenantId, id: UserId): Promise<User | null> {
    const user = this.store.get(id.value);
    return user && user.tenantId.equals(tenantId) ? user : null;
  }

  async findByEmail(tenantId: TenantId, email: Email): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.tenantId.equals(tenantId) && user.email.equals(email)) return user;
    }
    return null;
  }

  async findAll(tenantId: TenantId): Promise<User[]> {
    return [...this.store.values()].filter((user) => user.tenantId.equals(tenantId));
  }

  async countActiveWithRole(tenantId: TenantId, roleId: RoleId): Promise<number> {
    const users = await this.findAll(tenantId);
    return users.filter((user) => user.status === UserStatus.Active && user.hasRole(roleId)).length;
  }
}
