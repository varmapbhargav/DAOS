import { RightsId, TenantId } from '@daos/shared-kernel';

import { AssetRights } from '../entities/asset-rights.entity';

export interface AssetRightsRepository {
  save(rights: AssetRights): Promise<void>;
  findById(tenantId: TenantId, id: RightsId): Promise<AssetRights | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetRights[]>;
  delete(tenantId: TenantId, id: RightsId): Promise<void>;
}
