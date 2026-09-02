import { CompletenessId, TenantId } from '@daos/shared-kernel';

import { CompletenessResult } from '../entities/completeness-result.entity';

export interface CompletenessResultRepository {
  save(result: CompletenessResult): Promise<void>;
  findById(tenantId: TenantId, id: CompletenessId): Promise<CompletenessResult | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<CompletenessResult | null>;
}