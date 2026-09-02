import { RiskItemId, TenantId } from '@daos/shared-kernel';

import { RiskItem } from '../entities/risk-item.entity';

export interface RiskItemRepository {
  save(item: RiskItem): Promise<void>;
  findById(tenantId: TenantId, id: RiskItemId): Promise<RiskItem | null>;
  findByAssessmentId(tenantId: TenantId, assessmentId: string): Promise<RiskItem[]>;
}