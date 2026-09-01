import { TenantId } from '@daos/shared-kernel';

import { AssetTransferability } from '../entities/asset-transferability.entity';

export interface AssetTransferabilityRepository {
  save(transferability: AssetTransferability): Promise<void>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetTransferability | null>;
  delete(tenantId: TenantId, assetId: string): Promise<void>;
}
