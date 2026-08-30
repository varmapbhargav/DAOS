import { DomainEvent } from '@daos/shared-kernel';

export class TermsChanged extends DomainEvent {
  get eventType(): string { return 'deal.terms.changed.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
  ) {
    super(aggregateId, tenantId);
  }
}