import { ScreeningCriterionOutcome, ScreeningId, ScreeningResultStatus, TenantId } from '@daos/shared-kernel';

import { ScreeningResult } from '../../../domain/entities/screening-result.entity';
import { ScreeningResultOrmEntity } from '../entities/screening-result.orm-entity';

export class ScreeningResultMapper {
  static toDomain(e: ScreeningResultOrmEntity): ScreeningResult {
    return ScreeningResult.reconstruct({
      id: ScreeningId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseId: e.caseId,
      decision: e.decision as ScreeningResultStatus,
      score: e.score,
      maxScore: e.maxScore,
      criteria: (e.criteria ?? []) as ScreeningCriterionOutcome[],
      comments: e.comments,
      reviewer: e.reviewer,
      reviewedAt: e.reviewedAt,
      overrideBy: e.overrideBy,
      overrideReason: e.overrideReason,
    });
  }

  static toOrm(domain: ScreeningResult): ScreeningResultOrmEntity {
    const e = new ScreeningResultOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseId = domain.caseId;
    e.decision = domain.decision;
    e.score = domain.score;
    e.maxScore = domain.maxScore;
    e.criteria = domain.criteria;
    e.comments = domain.comments;
    e.reviewer = domain.reviewer;
    e.reviewedAt = domain.reviewedAt;
    e.overrideBy = domain.overrideBy;
    e.overrideReason = domain.overrideReason;
    return e;
  }
}
