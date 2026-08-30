import { CashFlowModelId, TenantId } from '@daos/shared-kernel';
import { CashFlowModel } from '../aggregates/cash-flow-model.aggregate';

export interface CashFlowModelRepository {
  save(model: CashFlowModel): Promise<void>;
  findById(id: CashFlowModelId, tenantId: TenantId): Promise<CashFlowModel | null>;
  findByAssetId(assetId: string, tenantId: TenantId): Promise<CashFlowModel[]>;
  delete(id: CashFlowModelId, tenantId: TenantId): Promise<void>;
}
