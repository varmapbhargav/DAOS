import { ApprovalDecisionType, DomainEvent } from '@daos/shared-kernel';

export class ApprovalDecisionRecorded extends DomainEvent {
  get eventType(): string {
    return 'origination-case.approval-decision-recorded.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly approvalDecisionId: string,
    public readonly caseId: string,
    public readonly approver: string,
    public readonly decision: ApprovalDecisionType,
    public readonly level: string,
    public readonly reason: string | null,
    public readonly conditions: string[],
    public readonly isFinal: boolean,
  ) {
    super(aggregateId, tenantId);
  }
}

export class ApprovalCompleted extends DomainEvent {
  get eventType(): string {
    return 'origination-case.approval-completed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly caseId: string,
    public readonly finalStatus: string,
    public readonly decidedBy: string,
    public readonly decidedAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}