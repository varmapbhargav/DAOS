import { DomainEvent } from '@daos/shared-kernel';

export class ApprovalChanged extends DomainEvent {
  get eventType(): string { return 'deal.approval.changed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly workflowId: string,
  ) {
    super(aggregateId, tenantId);
  }
}