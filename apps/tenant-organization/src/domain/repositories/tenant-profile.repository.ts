import { TenantId, TenantProfileId } from '@daos/shared-kernel';

import { TenantProfile } from '../aggregates/tenant-profile.aggregate';

export interface TenantProfileRepository {
  save(profile: TenantProfile): Promise<void>;
  findById(tenantId: TenantId, id: TenantProfileId): Promise<TenantProfile | null>;
  findByTenantId(tenantId: TenantId): Promise<TenantProfile | null>;
}
