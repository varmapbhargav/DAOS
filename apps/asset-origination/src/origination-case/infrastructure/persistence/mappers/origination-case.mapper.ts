import {
  CasePriority,
  DuplicateCheckStatus,
  InitialScreeningStatus,
  OriginationCaseId,
  OriginationCaseStatus,
  TenantId,
} from '@daos/shared-kernel';

import { OriginationCase } from '../../../domain/aggregates/origination-case.aggregate';
import { OriginationCaseOrmEntity } from '../entities/origination-case.orm-entity';

export class OriginationCaseMapper {
  static toDomain(e: OriginationCaseOrmEntity): OriginationCase {
    return OriginationCase.reconstruct({
      id: OriginationCaseId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseNumber: e.caseNumber,
      caseName: e.caseName,
      submissionType: e.submissionType,
      submissionChannel: e.submissionChannel,
      sourceId: e.sourceId,
      submittedBy: e.submittedBy,
      relationshipManagerId: e.relationshipManagerId,
      assignedTeamId: e.assignedTeamId,
      assignedAnalystId: e.assignedAnalystId,
      assetClass: e.assetClass,
      assetSubclass: e.assetSubclass,
      jurisdictions: e.jurisdictions ?? [],
      indicativeValueMinorUnits: e.indicativeValueMinorUnits,
      currency: e.currency,
      priority: e.priority as CasePriority,
      status: e.status as OriginationCaseStatus,
      nextAction: e.nextAction,
      nextActionDue: e.nextActionDue,
      duplicateCheckStatus: e.duplicateCheckStatus as DuplicateCheckStatus,
      initialScreeningStatus: e.initialScreeningStatus as InitialScreeningStatus,
      submittedAt: e.submittedAt,
      receivedAt: e.receivedAt,
      version: e.version,
    });
  }

  static toOrm(domain: OriginationCase): OriginationCaseOrmEntity {
    const e = new OriginationCaseOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseNumber = domain.caseNumber;
    e.caseName = domain.caseName;
    e.submissionType = domain.submissionType;
    e.submissionChannel = domain.submissionChannel;
    e.sourceId = domain.sourceId;
    e.submittedBy = domain.submittedBy;
    e.relationshipManagerId = domain.relationshipManagerId;
    e.assignedTeamId = domain.assignedTeamId;
    e.assignedAnalystId = domain.assignedAnalystId;
    e.assetClass = domain.assetClass;
    e.assetSubclass = domain.assetSubclass;
    e.jurisdictions = domain.jurisdictions;
    e.indicativeValueMinorUnits = domain.indicativeValueMinorUnits;
    e.currency = domain.currency;
    e.priority = domain.priority;
    e.status = domain.status;
    e.nextAction = domain.nextAction;
    e.nextActionDue = domain.nextActionDue;
    e.duplicateCheckStatus = domain.duplicateCheckStatus;
    e.initialScreeningStatus = domain.initialScreeningStatus;
    e.submittedAt = domain.submittedAt;
    e.receivedAt = domain.receivedAt;
    e.version = domain.version;
    return e;
  }
}
