import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { QualificationResult } from '../../domain/entities/qualification-result.entity';
import { ScreeningResult } from '../../domain/entities/screening-result.entity';
import { QualificationResultRepository } from '../../domain/repositories/qualification-result.repository';
import {
  QUALIFICATION_RESULT_REPOSITORY,
  SCREENING_RESULT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { ScreeningResultRepository } from '../../domain/repositories/screening-result.repository';

export class GetScreeningByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class GetQualificationByCaseQuery {
  constructor(public readonly caseId: string) {}
}

function toScreeningDto(s: ScreeningResult) {
  return {
    id: s.id.value,
    caseId: s.caseId,
    decision: s.decision,
    score: s.score,
    maxScore: s.maxScore,
    criteria: s.criteria,
    comments: s.comments,
    reviewer: s.reviewer,
    reviewedAt: s.reviewedAt,
    overrideBy: s.overrideBy,
    overrideReason: s.overrideReason,
  };
}

function toQualificationDto(q: QualificationResult) {
  return {
    id: q.id.value,
    caseId: q.caseId,
    decision: q.decision,
    score: q.score,
    blockers: q.blockers,
    missingEvidence: q.missingEvidence,
    explanation: q.explanation,
    qualifiedBy: q.qualifiedBy,
    qualifiedAt: q.qualifiedAt,
  };
}

@QueryHandler(GetScreeningByCaseQuery)
export class GetScreeningByCaseHandler implements IQueryHandler<GetScreeningByCaseQuery> {
  constructor(@Inject(SCREENING_RESULT_REPOSITORY) private readonly screenings: ScreeningResultRepository) {}

  async execute(query: GetScreeningByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const s = await this.screenings.findByCaseId(tenantId, query.caseId);
    return s ? toScreeningDto(s) : null;
  }
}

@QueryHandler(GetQualificationByCaseQuery)
export class GetQualificationByCaseHandler implements IQueryHandler<GetQualificationByCaseQuery> {
  constructor(@Inject(QUALIFICATION_RESULT_REPOSITORY) private readonly qualifications: QualificationResultRepository) {}

  async execute(query: GetQualificationByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const q = await this.qualifications.findByCaseId(tenantId, query.caseId);
    return q ? toQualificationDto(q) : null;
  }
}
