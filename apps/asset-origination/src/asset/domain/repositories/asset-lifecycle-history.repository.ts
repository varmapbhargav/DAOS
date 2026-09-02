import { AssetId, TenantId } from '@daos/shared-kernel';

import { AssetLifecycleHistory } from '../entities/asset-lifecycle-history.entity';

export interface AssetLifecycleHistoryRepository {
  save(history: AssetLifecycleHistory): Promise<void>;
  findByAssetId(tenantId: TenantId, assetId: AssetId): Promise<AssetLifecycleHistory[]>;
}