import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  APPROVAL_CASE_REPOSITORY,
  APPROVAL_DECISION_REPOSITORY,
  ENGINEERING_READINESS_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { ApprovalCaseRepository } from '../../domain/repositories/approval-case.repository';
import { ApprovalDecisionRepository } from '../../domain/repositories/approval-decision.repository';
import { EngineeringReadinessRepository } from '../../domain/repositories/engineering-readiness.repository';

export class GetApprovalByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListApprovalDecisionsByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class GetEngineeringReadinessByCaseQuery {
  constructor(public readonly caseId: string) {}
}

@QueryHandler(GetApprovalByCaseQuery)
export class GetApprovalByCaseHandler implements IQueryHandler<GetApprovalByCaseQuery> {
  constructor(@Inject(APPROVAL_CASE_REPOSITORY) private readonly approvalCases: ApprovalCaseRepository) {}

  async execute(query: GetApprovalByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const ac = await this.approvalCases.findByCaseId(tenantId, query.caseId);
    if (!ac) return null;
    return {
      id: ac.id.value,
      caseId: ac.caseId,
      status: ac.status,
      approvalType: ac.approvalType,
      levels: ac.levels,
      currentLevel: ac.currentLevel,
      thresholdAmount: ac.thresholdAmount,
      requiredApprovers: Object.fromEntries(ac.requiredApprovers),
      decisions: ac.decisions,
      conditions: ac.conditions,
      conflictOfInterestChecked: ac.conflictOfInterestChecked,
      startedAt: ac.startedAt,
      completedAt: ac.completedAt,
      finalDecidedBy: ac.finalDecidedBy,
      finalReason: ac.finalReason,
    };
  }
}

@QueryHandler(ListApprovalDecisionsByCaseQuery)
export class ListApprovalDecisionsByCaseHandler implements IQueryHandler<ListApprovalDecisionsByCaseQuery> {
  constructor(@Inject(APPROVAL_DECISION_REPOSITORY) private readonly decisions: ApprovalDecisionRepository) {}

  async execute(query: ListApprovalDecisionsByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const rows = await this.decisions.findByCaseId(tenantId, query.caseId);
    return rows.map((d) => ({
      id: d.id.value,
      caseId: d.caseId,
      approvalCaseId: d.approvalCaseId,
      approver: d.approver,
      level: d.level,
      decision: d.decision,
      reason: d.reason,
      conditions: d.conditions,
      decidedAt: d.decidedAt,
    }));
  }
}

@QueryHandler(GetEngineeringReadinessByCaseQuery)
export class GetEngineeringReadinessByCaseHandler implements IQueryHandler<GetEngineeringReadinessByCaseQuery> {
  constructor(@Inject(ENGINEERING_READINESS_REPOSITORY) private readonly assessments: EngineeringReadinessRepository) {}

  async execute(query: GetEngineeringReadinessByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const a = await this.assessments.findByCaseId(tenantId, query.caseId);
    if (!a) return null;
    return {
      id: a.id.value,
      caseId: a.caseId,
      assetId: a.assetId,
      status: a.status,
      checks: Object.fromEntries(a.checks),
      assessedBy: a.assessedBy,
      assessedAt: a.assessedAt,
      summary: a.summary,
    };
  }
}