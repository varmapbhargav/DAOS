import { QualificationId, TenantId } from '@daos/shared-kernel';

import { QualificationResult } from '../entities/qualification-result.entity';

export interface QualificationResultRepository {
  save(qualification: QualificationResult): Promise<void>;
  findById(tenantId: TenantId, id: QualificationId): Promise<QualificationResult | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<QualificationResult | null>;
}
