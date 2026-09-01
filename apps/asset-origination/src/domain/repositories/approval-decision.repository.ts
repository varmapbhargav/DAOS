import { ApprovalDecisionId, TenantId } from '@daos/shared-kernel';

import { ApprovalDecision } from '../entities/approval-decision.entity';

export interface ApprovalDecisionRepository {
  save(decision: ApprovalDecision): Promise<void>;
  findById(tenantId: TenantId, id: ApprovalDecisionId): Promise<ApprovalDecision | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<ApprovalDecision[]>;
  findByApprovalCaseId(tenantId: TenantId, approvalCaseId: string): Promise<ApprovalDecision[]>;
}