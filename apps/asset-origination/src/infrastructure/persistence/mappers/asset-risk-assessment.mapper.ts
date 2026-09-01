import { AssetRiskAssessmentId, TenantId } from '@daos/shared-kernel';

import { AssetRiskAssessment } from '../../../domain/entities/asset-risk-assessment.entity';
import { AssetRiskAssessmentOrmEntity } from '../entities/asset-risk-assessment.orm-entity';

export class AssetRiskAssessmentMapper {
  static toOrm(assessment: AssetRiskAssessment): AssetRiskAssessmentOrmEntity {
    const orm = new AssetRiskAssessmentOrmEntity();
    orm.id = assessment.id.value;
    orm.tenantId = assessment.tenantId.value;
    orm.caseId = assessment.caseId;
    orm.overallScore = assessment.overallScore;
    orm.riskLevel = assessment.riskLevel;
    orm.assessedBy = assessment.assessedBy;
    orm.assessedAt = assessment.assessedAt;
    orm.summary = assessment.summary;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: AssetRiskAssessmentOrmEntity): AssetRiskAssessment {
    return AssetRiskAssessment.reconstruct({
      id: AssetRiskAssessmentId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      overallScore: orm.overallScore,
      riskLevel: orm.riskLevel as AssetRiskAssessment['riskLevel'],
      assessedBy: orm.assessedBy,
      assessedAt: orm.assessedAt,
      summary: orm.summary,
    });
  }
}