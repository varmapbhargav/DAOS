import { NotFoundError, OriginationCaseId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OriginationCase } from '../../domain/aggregates/origination-case.aggregate';
import { OriginationCaseRepository } from '../../domain/repositories/origination-case.repository';
import { ORIGINATION_CASE_REPOSITORY } from '../../domain/repositories/repository.tokens';

export interface OriginationCaseDto {
  id: string;
  caseNumber: string;
  caseName: string;
  submissionType: string;
  submissionChannel: string;
  sourceId: string;
  submittedBy: string;
  relationshipManagerId: string | null;
  assignedTeamId: string | null;
  assignedAnalystId: string | null;
  assetClass: string;
  assetSubclass: string | null;
  jurisdictions: string[];
  indicativeValueMinorUnits: string | null;
  currency: string | null;
  priority: string;
  status: string;
  nextAction: string | null;
  nextActionDue: string | null;
  duplicateCheckStatus: string;
  initialScreeningStatus: string;
  submittedAt: string | null;
  receivedAt: string | null;
}

export function toOriginationCaseDto(c: OriginationCase): OriginationCaseDto {
  return {
    id: c.id.value,
    caseNumber: c.caseNumber,
    caseName: c.caseName,
    submissionType: c.submissionType,
    submissionChannel: c.submissionChannel,
    sourceId: c.sourceId,
    submittedBy: c.submittedBy,
    relationshipManagerId: c.relationshipManagerId,
    assignedTeamId: c.assignedTeamId,
    assignedAnalystId: c.assignedAnalystId,
    assetClass: c.assetClass,
    assetSubclass: c.assetSubclass,
    jurisdictions: c.jurisdictions,
    indicativeValueMinorUnits: c.indicativeValueMinorUnits,
    currency: c.currency,
    priority: c.priority,
    status: c.status,
    nextAction: c.nextAction,
    nextActionDue: c.nextActionDue,
    duplicateCheckStatus: c.duplicateCheckStatus,
    initialScreeningStatus: c.initialScreeningStatus,
    submittedAt: c.submittedAt,
    receivedAt: c.receivedAt,
  };
}

export class GetOriginationCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListOriginationCasesQuery {}

export class GetOriginationCaseByNumberQuery {
  constructor(public readonly caseNumber: string) {}
}

@QueryHandler(GetOriginationCaseQuery)
export class GetOriginationCaseHandler implements IQueryHandler<GetOriginationCaseQuery, OriginationCaseDto> {
  constructor(@Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository) {}

  async execute(query: GetOriginationCaseQuery): Promise<OriginationCaseDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(query.caseId));
    if (!c) throw new NotFoundError(`Case not found: ${query.caseId}`);
    return toOriginationCaseDto(c);
  }
}

@QueryHandler(ListOriginationCasesQuery)
export class ListOriginationCasesHandler implements IQueryHandler<ListOriginationCasesQuery, OriginationCaseDto[]> {
  constructor(@Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository) {}

  async execute(): Promise<OriginationCaseDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const cases = await this.cases.findAll(tenantId);
    return cases.map(toOriginationCaseDto);
  }
}

@QueryHandler(GetOriginationCaseByNumberQuery)
export class GetOriginationCaseByNumberHandler implements IQueryHandler<GetOriginationCaseByNumberQuery, OriginationCaseDto> {
  constructor(@Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository) {}

  async execute(query: GetOriginationCaseByNumberQuery): Promise<OriginationCaseDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findByCaseNumber(tenantId, query.caseNumber);
    if (!c) throw new NotFoundError(`Case not found: ${query.caseNumber}`);
    return toOriginationCaseDto(c);
  }
}
