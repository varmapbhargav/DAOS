import { ApprovalDecisionId, ApprovalDecisionType, ApprovalLevel, TenantId } from '@daos/shared-kernel';

export class ApprovalDecision {
  private constructor(
    public readonly id: ApprovalDecisionId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    public readonly approvalCaseId: string,
    public readonly approver: string,
    public readonly level: ApprovalLevel,
    public readonly decision: ApprovalDecisionType,
    public readonly reason: string | null,
    public readonly conditions: string[],
    public readonly decidedAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    approvalCaseId: string;
    approver: string;
    level: ApprovalLevel;
    decision: ApprovalDecisionType;
    reason?: string | null;
    conditions?: string[];
  }): ApprovalDecision {
    return new ApprovalDecision(
      ApprovalDecisionId.create(),
      params.tenantId,
      params.caseId,
      params.approvalCaseId,
      params.approver,
      params.level,
      params.decision,
      params.reason ?? null,
      params.conditions ?? [],
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: ApprovalDecisionId;
    tenantId: TenantId;
    caseId: string;
    approvalCaseId: string;
    approver: string;
    level: ApprovalLevel;
    decision: ApprovalDecisionType;
    reason: string | null;
    conditions: string[];
    decidedAt: string;
  }): ApprovalDecision {
    return new ApprovalDecision(
      params.id,
      params.tenantId,
      params.caseId,
      params.approvalCaseId,
      params.approver,
      params.level,
      params.decision,
      params.reason,
      params.conditions,
      params.decidedAt,
    );
  }
}