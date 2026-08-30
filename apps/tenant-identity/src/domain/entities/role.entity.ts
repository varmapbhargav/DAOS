import { RoleId, TenantId } from '@daos/shared-kernel';

import { Permission } from '../value-objects/permission';

export class Role {
  constructor(
    public readonly id: RoleId,
    public readonly tenantId: TenantId,
    public readonly name: string,
    private readonly permissions: Permission[],
    public readonly version: number = 0,
  ) {}

  static create(params: { tenantId: TenantId; name: string; permissions: Permission[] }): Role {
    if (!params.name.trim()) throw new Error('Role name is required');
    return new Role(RoleId.create(), params.tenantId, params.name.trim(), [...params.permissions]);
  }

  static reconstruct(params: {
    id: RoleId;
    tenantId: TenantId;
    name: string;
    permissions: Permission[];
    version: number;
  }): Role {
    return new Role(params.id, params.tenantId, params.name, [...params.permissions], params.version);
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions.some((p) => p.equals(permission));
  }

  get permissionList(): Permission[] {
    return [...this.permissions];
  }
}
