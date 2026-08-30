import { AssetId, TenantId } from '@daos/shared-kernel';

import { Asset } from '../aggregates/asset.aggregate';

export interface AssetRepository {
  save(asset: Asset): Promise<void>;
  findById(tenantId: TenantId, id: AssetId): Promise<Asset | null>;
  findAll(tenantId: TenantId): Promise<Asset[]>;
}
