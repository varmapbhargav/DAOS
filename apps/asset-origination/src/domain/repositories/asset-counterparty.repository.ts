import { CounterpartyId, TenantId } from '@daos/shared-kernel';

import { AssetCounterparty } from '../entities/asset-counterparty.entity';

export interface AssetCounterpartyRepository {
  save(counterparty: AssetCounterparty): Promise<void>;
  findById(tenantId: TenantId, id: CounterpartyId): Promise<AssetCounterparty | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetCounterparty[]>;
  delete(tenantId: TenantId, id: CounterpartyId): Promise<void>;
}
