import { ClaimId, TenantId } from '@daos/shared-kernel';

import { AssetClaim } from '../entities/asset-claim.entity';

export interface AssetClaimRepository {
  save(claim: AssetClaim): Promise<void>;
  findById(tenantId: TenantId, id: ClaimId): Promise<AssetClaim | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetClaim[]>;
}
