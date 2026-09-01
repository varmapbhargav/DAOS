import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AssetRiskAssessmentRepository } from '../../domain/repositories/asset-risk-assessment.repository';
import { DdFindingRepository } from '../../domain/repositories/dd-finding.repository';
import { DueDiligenceCaseRepository } from '../../domain/repositories/due-diligence-case.repository';
import {
  ASSET_RISK_ASSESSMENT_REPOSITORY,
  DD_FINDING_REPOSITORY,
  DUE_DILIGENCE_CASE_REPOSITORY,
  RISK_ITEM_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { RiskItemRepository } from '../../domain/repositories/risk-item.repository';

export class GetDueDiligenceByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListDdFindingsByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class GetRiskAssessmentByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListRiskItemsByCaseQuery {
  constructor(public readonly caseId: string) {}
}

@QueryHandler(GetDueDiligenceByCaseQuery)
export class GetDueDiligenceByCaseHandler implements IQueryHandler<GetDueDiligenceByCaseQuery> {
  constructor(@Inject(DUE_DILIGENCE_CASE_REPOSITORY) private readonly ddCases: DueDiligenceCaseRepository) {}

  async execute(query: GetDueDiligenceByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const ddCase = await this.ddCases.findByCaseId(tenantId, query.caseId);
    if (!ddCase) return null;
    return {
      id: ddCase.id.value,
      caseId: ddCase.caseId,
      status: ddCase.status,
      checklist: ddCase.checklist,
      reviewers: ddCase.reviewers,
      dueDate: ddCase.dueDate,
      startedAt: ddCase.startedAt,
      completedAt: ddCase.completedAt,
      summary: ddCase.summary,
    };
  }
}

@QueryHandler(ListDdFindingsByCaseQuery)
export class ListDdFindingsByCaseHandler implements IQueryHandler<ListDdFindingsByCaseQuery> {
  constructor(
    @Inject(DD_FINDING_REPOSITORY) private readonly findings: DdFindingRepository,
    @Inject(DUE_DILIGENCE_CASE_REPOSITORY) private readonly ddCases: DueDiligenceCaseRepository,
  ) {}

  async execute(query: ListDdFindingsByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const ddCase = await this.ddCases.findByCaseId(tenantId, query.caseId);
    if (!ddCase) return [];
    const rows = await this.findings.findByDdCaseId(tenantId, ddCase.id.value);
    return rows.map((f) => ({
      id: f.id.value,
      caseId: f.caseId,
      category: f.category,
      severity: f.severity,
      description: f.description,
      evidence: f.evidence,
      impact: f.impact,
      recommendation: f.recommendation,
      remediation: f.remediation,
      owner: f.owner,
      dueDate: f.dueDate,
      status: f.status,
      reviewer: f.reviewer,
      createdAt: f.createdAt,
    }));
  }
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