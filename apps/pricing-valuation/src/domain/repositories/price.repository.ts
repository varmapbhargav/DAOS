import { PriceId, TenantId } from '@daos/shared-kernel';

import { Price } from '../aggregates/price.aggregate';

export interface PriceRepository {
  save(price: Price): Promise<void>;
  findById(tenantId: TenantId, id: PriceId): Promise<Price | null>;
  findByIsin(tenantId: TenantId, isin: string): Promise<Price | null>;
  findAll(tenantId: TenantId): Promise<Price[]>;
  findStale(tenantId: TenantId): Promise<Price[]>;
}
