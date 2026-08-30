import { TenantId, WaterfallId } from '@daos/shared-kernel';
import { DistributionWaterfall } from '../aggregates/distribution-waterfall.aggregate';

export interface DistributionWaterfallRepository {
  save(wf: DistributionWaterfall): Promise<void>;
  findById(tenantId: TenantId, id: WaterfallId): Promise<DistributionWaterfall | null>;
  findByDealId(tenantId: TenantId, dealId: string): Promise<DistributionWaterfall | null>;
}
