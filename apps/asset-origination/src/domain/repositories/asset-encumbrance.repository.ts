import { EncumbranceId, TenantId } from '@daos/shared-kernel';

import { AssetEncumbrance } from '../entities/asset-encumbrance.entity';

export interface AssetEncumbranceRepository {
  save(encumbrance: AssetEncumbrance): Promise<void>;
  findById(tenantId: TenantId, id: EncumbranceId): Promise<AssetEncumbrance | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetEncumbrance[]>;
  delete(tenantId: TenantId, id: EncumbranceId): Promise<void>;
}
