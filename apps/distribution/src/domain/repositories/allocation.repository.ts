import { AllocationId, TenantId } from '@daos/shared-kernel';

import { Allocation } from '../aggregates/allocation.aggregate';

export interface AllocationRepository {
  save(allocation: Allocation): Promise<void>;
  findById(tenantId: TenantId, id: AllocationId): Promise<Allocation | null>;
  findByProductId(tenantId: TenantId, productId: string): Promise<Allocation[]>;
  findByClosingId(tenantId: TenantId, closingId: string): Promise<Allocation[]>;
  findAll(tenantId: TenantId): Promise<Allocation[]>;
}