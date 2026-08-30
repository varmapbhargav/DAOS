import { RoleId, TenantId } from '@daos/shared-kernel';

import { Role } from '../entities/role.entity';

export interface RoleRepository {
  save(role: Role): Promise<void>;
  saveAll(roles: Role[]): Promise<void>;
  findById(tenantId: TenantId, id: RoleId): Promise<Role | null>;
  findAll(tenantId: TenantId): Promise<Role[]>;
  findByName(tenantId: TenantId, name: string): Promise<Role | null>;
}
