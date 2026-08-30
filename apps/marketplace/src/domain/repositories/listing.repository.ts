import { ListingId, TenantId } from '@daos/shared-kernel';

import { Listing } from '../aggregates/listing.aggregate';

export interface ListingRepository {
  save(listing: Listing): Promise<void>;
  findById(tenantId: TenantId, id: ListingId): Promise<Listing | null>;
  findByProductId(tenantId: TenantId, productId: string): Promise<Listing[]>;
  findAll(tenantId: TenantId): Promise<Listing[]>;
  findActive(tenantId: TenantId): Promise<Listing[]>;
}
