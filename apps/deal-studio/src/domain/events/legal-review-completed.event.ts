import { DomainEvent } from '@daos/shared-kernel';

export class LegalReviewCompleted extends DomainEvent {
  get eventType(): string { return 'deal.legal-review.completed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
