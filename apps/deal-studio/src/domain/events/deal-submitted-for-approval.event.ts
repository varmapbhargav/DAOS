import { DomainEvent } from '@daos/shared-kernel';

export class DealSubmittedForApproval extends DomainEvent {
  get eventType(): string { return 'deal.submitted-for-approval.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly workflowId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
