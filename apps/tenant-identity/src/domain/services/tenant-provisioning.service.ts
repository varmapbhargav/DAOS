import { Email } from '@daos/shared-kernel';

import { Tenant } from '../aggregates/tenant.aggregate';
import { User } from '../aggregates/user.aggregate';
import { Role } from '../entities/role.entity';
import { createDefaultRoles, ROLE_NAMES } from './default-roles';

export interface ProvisionResult {
  tenant: Tenant;
  admin: User;
  roles: Role[];
}

export class TenantProvisioningService {
  provision(params: {
    subdomain: string;
    name: string;
    adminEmail: Email;
    adminPasswordHash: string;
  }): ProvisionResult {
    const tenant = Tenant.provision({ subdomain: params.subdomain, name: params.name });
    const roles = createDefaultRoles(tenant.id);
    const adminRole = roles.find((r) => r.name === ROLE_NAMES.tenantAdmin);
    if (!adminRole) throw new Error('tenant-admin role is missing from defaults');
    const admin = User.onboard({
      tenantId: tenant.id,
      email: params.adminEmail,
      passwordHash: params.adminPasswordHash,
      roleIds: [adminRole.id],
    });
    return { tenant, admin, roles };
  }
}
