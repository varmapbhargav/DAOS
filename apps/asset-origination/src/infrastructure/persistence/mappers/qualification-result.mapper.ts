import { QualificationBlocker, QualificationId, QualificationResultStatus, QualificationScoreBreakdown, TenantId } from '@daos/shared-kernel';

import { QualificationResult } from '../../../domain/entities/qualification-result.entity';
import { QualificationResultOrmEntity } from '../entities/qualification-result.orm-entity';

export class QualificationResultMapper {
  static toDomain(e: QualificationResultOrmEntity): QualificationResult {
    return QualificationResult.reconstruct({
      id: QualificationId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseId: e.caseId,
      decision: e.decision as QualificationResultStatus,
      score: e.score as unknown as QualificationScoreBreakdown,
      blockers: (e.blockers ?? []) as QualificationBlocker[],
      missingEvidence: e.missingEvidence ?? [],
      explanation: e.explanation,
      qualifiedBy: e.qualifiedBy,
      qualifiedAt: e.qualifiedAt,
    });
  }

  static toOrm(domain: QualificationResult): QualificationResultOrmEntity {
    const e = new QualificationResultOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseId = domain.caseId;
    e.decision = domain.decision;
    e.score = domain.score as unknown as Record<string, unknown>;
    e.blockers = domain.blockers as unknown as Record<string, unknown>[];
    e.missingEvidence = domain.missingEvidence;
    e.explanation = domain.explanation;
    e.qualifiedBy = domain.qualifiedBy;
    e.qualifiedAt = domain.qualifiedAt;
    return e;
  }
}
