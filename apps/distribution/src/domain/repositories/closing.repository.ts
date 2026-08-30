import { ClosingId, TenantId } from '@daos/shared-kernel';

import { Closing } from '../aggregates/closing.aggregate';

export interface ClosingRepository {
  save(closing: Closing): Promise<void>;
  findById(tenantId: TenantId, id: ClosingId): Promise<Closing | null>;
  findByProductId(tenantId: TenantId, productId: string): Promise<Closing[]>;
  findAll(tenantId: TenantId): Promise<Closing[]>;
}