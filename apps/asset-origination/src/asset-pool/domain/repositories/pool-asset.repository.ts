import { PoolAssetId, TenantId } from '@daos/shared-kernel';

import { PoolAsset } from '../entities/pool-asset.entity';

export interface PoolAssetRepository {
  save(poolAsset: PoolAsset): Promise<void>;
  findById(tenantId: TenantId, id: PoolAssetId): Promise<PoolAsset | null>;
  findByPoolId(tenantId: TenantId, poolId: string): Promise<PoolAsset[]>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<PoolAsset | null>;
  findActiveByPoolId(tenantId: TenantId, poolId: string): Promise<PoolAsset[]>;
}