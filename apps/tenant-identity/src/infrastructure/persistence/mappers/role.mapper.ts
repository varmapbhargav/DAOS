import { RoleId, TenantId } from '@daos/shared-kernel';

import { Role } from '../../../domain/entities/role.entity';
import { Permission } from '../../../domain/value-objects/permission';
import { RoleOrmEntity } from '../entities/role.orm-entity';

export class RoleMapper {
  static toDomain(e: RoleOrmEntity): Role {
    return Role.reconstruct({
      id: RoleId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      name: e.name,
      permissions: (e.permissions as string[]).map((p) => Permission.parse(p)),
      version: e.version,
    });
  }

  static toOrm(domain: Role): RoleOrmEntity {
    const e = new RoleOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.name = domain.name;
    e.permissions = domain.permissionList.map((p) => p.toString());
    e.version = domain.version;
    return e;
  }
}
