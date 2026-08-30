import { DomainEvent } from '@daos/shared-kernel';

export class OpportunityRejected extends DomainEvent {
  get eventType(): string {
    return 'opportunity.rejected.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
