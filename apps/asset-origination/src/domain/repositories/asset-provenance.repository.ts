import { ProvenanceEventId, TenantId } from '@daos/shared-kernel';

import { AssetProvenance } from '../entities/asset-provenance.entity';

export interface AssetProvenanceRepository {
  save(provenance: AssetProvenance): Promise<void>;
  findById(tenantId: TenantId, id: ProvenanceEventId): Promise<AssetProvenance | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetProvenance[]>;
}
