import { EngineeringReadinessId, TenantId } from '@daos/shared-kernel';

import { EngineeringReadinessAssessment } from '../entities/engineering-readiness-assessment.entity';

export interface EngineeringReadinessRepository {
  save(assessment: EngineeringReadinessAssessment): Promise<void>;
  findById(tenantId: TenantId, id: EngineeringReadinessId): Promise<EngineeringReadinessAssessment | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<EngineeringReadinessAssessment | null>;
}