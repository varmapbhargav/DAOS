import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlockerRepository } from '../../domain/repositories/blocker.repository';
import { CompletenessResultRepository } from '../../domain/repositories/completeness-result.repository';
import {
  BLOCKER_REPOSITORY,
  COMPLETENESS_RESULT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';

export class GetCompletenessByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListBlockersByCaseQuery {
  constructor(public readonly caseId: string) {}
}

@QueryHandler(GetCompletenessByCaseQuery)
export class GetCompletenessByCaseHandler implements IQueryHandler<GetCompletenessByCaseQuery> {
  constructor(@Inject(COMPLETENESS_RESULT_REPOSITORY) private readonly completions: CompletenessResultRepository) {}

  async execute(query: GetCompletenessByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const r = await this.completions.findByCaseId(tenantId, query.caseId);
    if (!r) return null;
    return {
      id: r.id.value,
      caseId: r.caseId,
      breakdown: r.breakdown,
      calculatedBy: r.calculatedBy,
      calculatedAt: r.calculatedAt,
    };
  }
}

@QueryHandler(ListBlockersByCaseQuery)
export class ListBlockersByCaseHandler implements IQueryHandler<ListBlockersByCaseQuery> {
  constructor(@Inject(BLOCKER_REPOSITORY) private readonly blockers: BlockerRepository) {}

  async execute(query: ListBlockersByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const rows = await this.blockers.findByCaseId(tenantId, query.caseId);
    return rows.map((b) => ({
      id: b.id.value,
      caseId: b.caseId,
      severity: b.severity,
      category: b.category,
      description: b.description,
      owner: b.owner,
      dueDate: b.dueDate,
      resolutionAction: b.resolutionAction,
      evidenceReferences: b.evidenceReferences,
      resolutionStatus: b.resolutionStatus,
      resolvedBy: b.resolvedBy,
      resolvedAt: b.resolvedAt,
      resolvedReason: b.resolvedReason,
      raisedAt: b.raisedAt,
    }));
  }
}