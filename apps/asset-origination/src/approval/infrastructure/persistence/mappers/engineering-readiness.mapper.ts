import { EngineeringReadinessId, EngineeringReadinessStatus, TenantId } from '@daos/shared-kernel';

import { EngineeringReadinessAssessment } from '../../../domain/entities/engineering-readiness-assessment.entity';
import { EngineeringReadinessOrmEntity } from '../entities/engineering-readiness.orm-entity';

export class EngineeringReadinessMapper {
  static toOrm(assessment: EngineeringReadinessAssessment): EngineeringReadinessOrmEntity {
    const orm = new EngineeringReadinessOrmEntity();
    orm.id = assessment.id.value;
    orm.tenantId = assessment.tenantId.value;
    orm.caseId = assessment.caseId;
    orm.assetId = assessment.assetId;
    orm.status = assessment.status;
    orm.checks = Object.fromEntries(assessment.checks);
    orm.assessedBy = assessment.assessedBy;
    orm.assessedAt = assessment.assessedAt;
    orm.summary = assessment.summary;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: EngineeringReadinessOrmEntity): EngineeringReadinessAssessment {
    return EngineeringReadinessAssessment.reconstruct({
      id: EngineeringReadinessId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      assetId: orm.assetId,
      status: orm.status as EngineeringReadinessStatus,
      checks: new Map(Object.entries(orm.checks)),
      assessedBy: orm.assessedBy,
      assessedAt: orm.assessedAt,
      summary: orm.summary,
    });
  }
}