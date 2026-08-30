import { TenantId } from '@daos/shared-kernel';

import { Tenant } from '../aggregates/tenant.aggregate';

export interface TenantRepository {
  save(tenant: Tenant): Promise<void>;
  findById(id: TenantId): Promise<Tenant | null>;
  findBySubdomain(subdomain: string): Promise<Tenant | null>;
}
