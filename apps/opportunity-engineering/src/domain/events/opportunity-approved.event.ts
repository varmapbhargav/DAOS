import { DomainEvent } from '@daos/shared-kernel';

export class OpportunityApproved extends DomainEvent {
  get eventType(): string {
    return 'opportunity.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly approvedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}
