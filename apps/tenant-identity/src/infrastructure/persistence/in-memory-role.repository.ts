import { RoleId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

import { Role } from '../../domain/entities/role.entity';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new Map<string, Role>();

  async save(role: Role): Promise<void> {
    this.store.set(role.id.value, role);
  }

  async saveAll(roles: Role[]): Promise<void> {
    for (const role of roles) await this.save(role);
  }

  async findById(tenantId: TenantId, id: RoleId): Promise<Role | null> {
    const role = this.store.get(id.value);
    return role && role.tenantId.equals(tenantId) ? role : null;
  }

  async findAll(tenantId: TenantId): Promise<Role[]> {
    return [...this.store.values()].filter((role) => role.tenantId.equals(tenantId));
  }

  async findByName(tenantId: TenantId, name: string): Promise<Role | null> {
    const roles = await this.findAll(tenantId);
    return roles.find((role) => role.name === name) ?? null;
  }
}
