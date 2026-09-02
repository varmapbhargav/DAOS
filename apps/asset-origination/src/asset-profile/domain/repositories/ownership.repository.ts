import { OwnershipId, TenantId } from '@daos/shared-kernel';

import { Ownership } from '../entities/ownership.entity';

export interface OwnershipRepository {
  save(ownership: Ownership): Promise<void>;
  findById(tenantId: TenantId, id: OwnershipId): Promise<Ownership | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<Ownership[]>;
  delete(tenantId: TenantId, id: OwnershipId): Promise<void>;
}
