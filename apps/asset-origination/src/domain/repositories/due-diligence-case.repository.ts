import { DueDiligenceCaseId, TenantId } from '@daos/shared-kernel';

import { DueDiligenceCase } from '../entities/due-diligence-case.entity';

export interface DueDiligenceCaseRepository {
  save(ddCase: DueDiligenceCase): Promise<void>;
  findById(tenantId: TenantId, id: DueDiligenceCaseId): Promise<DueDiligenceCase | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<DueDiligenceCase | null>;
}