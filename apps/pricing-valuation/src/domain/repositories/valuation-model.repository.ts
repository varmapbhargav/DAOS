import { TenantId, ValuationModelId } from '@daos/shared-kernel';

import { ValuationModel } from '../aggregates/valuation-model.aggregate';

export interface ValuationModelRepository {
  save(model: ValuationModel): Promise<void>;
  findById(tenantId: TenantId, id: ValuationModelId): Promise<ValuationModel | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<ValuationModel[]>;
  findAll(tenantId: TenantId): Promise<ValuationModel[]>;
}
