import { ClosingConditionId, TenantId } from '@daos/shared-kernel';
import { ClosingCondition } from '../aggregates/closing-condition.aggregate';

export interface ClosingConditionRepository {
  save(cc: ClosingCondition): Promise<void>;
  findById(tenantId: TenantId, id: ClosingConditionId): Promise<ClosingCondition | null>;
  findByDealId(tenantId: TenantId, dealId: string): Promise<ClosingCondition[]>;
}
