import { DistributionId, TenantId } from '@daos/shared-kernel';

import { Distribution } from '../aggregates/distribution.aggregate';

export interface DistributionRepository {
  save(distribution: Distribution): Promise<void>;
  findById(tenantId: TenantId, id: DistributionId): Promise<Distribution | null>;
  findByProductId(tenantId: TenantId, productId: string): Promise<Distribution[]>;
  findAll(tenantId: TenantId): Promise<Distribution[]>;
  findByStatus(tenantId: TenantId, status: string): Promise<Distribution[]>;
}
