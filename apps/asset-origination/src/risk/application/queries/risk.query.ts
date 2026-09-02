import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ASSET_RISK_ASSESSMENT_REPOSITORY, RISK_ITEM_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AssetRiskAssessmentRepository } from '../../domain/repositories/asset-risk-assessment.repository';
import { RiskItemRepository } from '../../domain/repositories/risk-item.repository';

export class GetRiskAssessmentByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListRiskItemsByCaseQuery {
  constructor(public readonly caseId: string) {}
}

@QueryHandler(GetRiskAssessmentByCaseQuery)
export class GetRiskAssessmentByCaseHandler implements IQueryHandler<GetRiskAssessmentByCaseQuery> {
  constructor(@Inject(ASSET_RISK_ASSESSMENT_REPOSITORY) private readonly assessments: AssetRiskAssessmentRepository) {}

  async execute(query: GetRiskAssessmentByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const assessment = await this.assessments.findByCaseId(tenantId, query.caseId);
    if (!assessment) return null;
    return {
      id: assessment.id.value,
      caseId: assessment.caseId,
      overallScore: assessment.overallScore,
      riskLevel: assessment.riskLevel,
      assessedBy: assessment.assessedBy,
      assessedAt: assessment.assessedAt,
      summary: assessment.summary,
    };
  }
}

@QueryHandler(ListRiskItemsByCaseQuery)
export class ListRiskItemsByCaseHandler implements IQueryHandler<ListRiskItemsByCaseQuery> {
  constructor(
    @Inject(RISK_ITEM_REPOSITORY) private readonly riskItems: RiskItemRepository,
    @Inject(ASSET_RISK_ASSESSMENT_REPOSITORY) private readonly assessments: AssetRiskAssessmentRepository,
  ) {}

  async execute(query: ListRiskItemsByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const assessment = await this.assessments.findByCaseId(tenantId, query.caseId);
    if (!assessment) return [];
    const rows = await this.riskItems.findByAssessmentId(tenantId, assessment.id.value);
    return rows.map((r) => ({
      id: r.id.value,
      caseId: r.caseId,
      category: r.category,
      description: r.description,
      probability: r.probability,
      impact: r.impact,
      score: r.score,
      mitigation: r.mitigation,
      owner: r.owner,
      dueDate: r.dueDate,
      evidence: r.evidence,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }
}
