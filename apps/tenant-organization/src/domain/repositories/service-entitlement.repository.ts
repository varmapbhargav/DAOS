import { ServiceEntitlementId, TenantId } from '@daos/shared-kernel';

import { ServiceEntitlement } from '../aggregates/service-entitlement.aggregate';

export interface ServiceEntitlementRepository {
  save(entitlement: ServiceEntitlement): Promise<void>;
  findById(tenantId: TenantId, id: ServiceEntitlementId): Promise<ServiceEntitlement | null>;
  findByTenantId(tenantId: TenantId): Promise<ServiceEntitlement | null>;
}
