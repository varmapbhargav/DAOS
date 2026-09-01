import { ApprovalDecisionId, ApprovalDecisionType, ApprovalLevel, TenantId } from '@daos/shared-kernel';

import { ApprovalDecision } from '../../../domain/entities/approval-decision.entity';
import { ApprovalDecisionOrmEntity } from '../entities/approval-decision.orm-entity';

export class ApprovalDecisionMapper {
  static toOrm(decision: ApprovalDecision): ApprovalDecisionOrmEntity {
    const orm = new ApprovalDecisionOrmEntity();
    orm.id = decision.id.value;
    orm.tenantId = decision.tenantId.value;
    orm.caseId = decision.caseId;
    orm.approvalCaseId = decision.approvalCaseId;
    orm.approver = decision.approver;
    orm.level = decision.level;
    orm.decision = decision.decision;
    orm.reason = decision.reason;
    orm.conditions = decision.conditions;
    orm.decidedAt = decision.decidedAt;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: ApprovalDecisionOrmEntity): ApprovalDecision {
    return ApprovalDecision.reconstruct({
      id: ApprovalDecisionId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      approvalCaseId: orm.approvalCaseId,
      approver: orm.approver,
      level: orm.level as ApprovalLevel,
      decision: orm.decision as ApprovalDecisionType,
      reason: orm.reason,
      conditions: orm.conditions,
      decidedAt: orm.decidedAt,
    });
  }
}