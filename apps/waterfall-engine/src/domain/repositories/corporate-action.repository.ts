import { CorporateActionId, TenantId } from '@daos/shared-kernel';

import { CorporateAction } from '../aggregates/corporate-action.aggregate';

export interface CorporateActionRepository {
  save(action: CorporateAction): Promise<void>;
  findById(tenantId: TenantId, id: CorporateActionId): Promise<CorporateAction | null>;
  findByIssuanceId(tenantId: TenantId, issuanceId: string): Promise<CorporateAction[]>;
  findAll(tenantId: TenantId): Promise<CorporateAction[]>;
  findByStatus(tenantId: TenantId, status: string): Promise<CorporateAction[]>;
}
