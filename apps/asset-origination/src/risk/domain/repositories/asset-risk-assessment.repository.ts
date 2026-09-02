import { AssetRiskAssessmentId, TenantId } from '@daos/shared-kernel';

import { AssetRiskAssessment } from '../entities/asset-risk-assessment.entity';

export interface AssetRiskAssessmentRepository {
  save(assessment: AssetRiskAssessment): Promise<void>;
  findById(tenantId: TenantId, id: AssetRiskAssessmentId): Promise<AssetRiskAssessment | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<AssetRiskAssessment | null>;
}