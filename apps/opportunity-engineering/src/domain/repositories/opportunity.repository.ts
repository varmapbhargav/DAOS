import { OpportunityId, TenantId } from '@daos/shared-kernel';

import { Opportunity } from '../aggregates/opportunity.aggregate';

export interface OpportunityRepository {
  save(opportunity: Opportunity): Promise<void>;
  findById(tenantId: TenantId, id: OpportunityId): Promise<Opportunity | null>;
  findAll(tenantId: TenantId): Promise<Opportunity[]>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<Opportunity | null>;
}
