import { ApprovalId, ApprovalType, CaseApprovalStatus, TenantId } from '@daos/shared-kernel';

import { ApprovalCase } from '../../../domain/entities/approval-case.entity';
import { ApprovalCaseOrmEntity } from '../entities/approval-case.orm-entity';

export class ApprovalCaseMapper {
  static toOrm(approvalCase: ApprovalCase): ApprovalCaseOrmEntity {
    const orm = new ApprovalCaseOrmEntity();
    orm.id = approvalCase.id.value;
    orm.tenantId = approvalCase.tenantId.value;
    orm.caseId = approvalCase.caseId;
    orm.status = approvalCase.status;
    orm.approvalType = approvalCase.approvalType;
    orm.levels = approvalCase.levels;
    orm.currentLevel = approvalCase.currentLevel;
    orm.thresholdAmount = approvalCase.thresholdAmount;
    orm.requiredApprovers = Object.fromEntries(approvalCase.requiredApprovers);
    orm.decisions = approvalCase.decisions;
    orm.conditions = approvalCase.conditions;
    orm.conflictOfInterestChecked = approvalCase.conflictOfInterestChecked;
    orm.startedAt = approvalCase.startedAt;
    orm.completedAt = approvalCase.completedAt;
    orm.finalDecidedBy = approvalCase.finalDecidedBy;
    orm.finalReason = approvalCase.finalReason;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: ApprovalCaseOrmEntity): ApprovalCase {
    return ApprovalCase.reconstruct({
      id: ApprovalId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      status: orm.status as CaseApprovalStatus,
      approvalType: orm.approvalType as ApprovalType,
      levels: orm.levels,
      currentLevel: orm.currentLevel,
      thresholdAmount: orm.thresholdAmount,
      requiredApprovers: new Map(Object.entries(orm.requiredApprovers)),
      decisions: orm.decisions,
      conditions: orm.conditions,
      conflictOfInterestChecked: orm.conflictOfInterestChecked,
      startedAt: orm.startedAt,
      completedAt: orm.completedAt,
      finalDecidedBy: orm.finalDecidedBy,
      finalReason: orm.finalReason,
    });
  }
}