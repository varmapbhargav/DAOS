import { DomainEvent } from '@daos/shared-kernel';

export class DealSubmittedForLegalReview extends DomainEvent {
  get eventType(): string { return 'deal.submitted-for-legal-review.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
