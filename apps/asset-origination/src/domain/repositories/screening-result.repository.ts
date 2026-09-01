import { ScreeningId, TenantId } from '@daos/shared-kernel';

import { ScreeningResult } from '../entities/screening-result.entity';

export interface ScreeningResultRepository {
  save(screening: ScreeningResult): Promise<void>;
  findById(tenantId: TenantId, id: ScreeningId): Promise<ScreeningResult | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<ScreeningResult | null>;
}
