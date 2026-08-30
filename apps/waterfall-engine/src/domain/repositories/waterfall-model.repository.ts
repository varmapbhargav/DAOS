import { TenantId, WaterfallModelId } from '@daos/shared-kernel';

import { WaterfallModel } from '../aggregates/waterfall-model.aggregate';

export interface WaterfallModelRepository {
  save(model: WaterfallModel): Promise<void>;
  findById(tenantId: TenantId, id: WaterfallModelId): Promise<WaterfallModel | null>;
  findByProductId(tenantId: TenantId, productId: string): Promise<WaterfallModel[]>;
  findAll(tenantId: TenantId): Promise<WaterfallModel[]>;
  findApproved(tenantId: TenantId): Promise<WaterfallModel[]>;
}
