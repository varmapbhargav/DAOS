import { TenantId } from '@daos/shared-kernel';

import { Role } from '../entities/role.entity';
import { Permission } from '../value-objects/permission';

export const ROLE_NAMES = {
  tenantAdmin: 'tenant-admin',
  member: 'member',
  complianceOfficer: 'compliance-officer',
  platformAdmin: 'platform-admin',
} as const;

export function createDefaultRoles(tenantId: TenantId): Role[] {
  return [
    Role.create({
      tenantId,
      name: ROLE_NAMES.tenantAdmin,
      permissions: [
        Permission.parse('tenant:read'),
        Permission.parse('tenant:update'),
        Permission.parse('user:read'),
        Permission.parse('user:invite'),
        Permission.parse('user:update'),
        Permission.parse('user:assign-role'),
        Permission.parse('role:read'),
      ],
    }),
    Role.create({
      tenantId,
      name: ROLE_NAMES.member,
      permissions: [Permission.parse('tenant:read'), Permission.parse('user:read'), Permission.parse('role:read')],
    }),
    Role.create({
      tenantId,
      name: ROLE_NAMES.complianceOfficer,
      permissions: [
        Permission.parse('tenant:read'),
        Permission.parse('user:read'),
        Permission.parse('role:read'),
        Permission.parse('compliance:read'),
      ],
    }),
  ];
}
