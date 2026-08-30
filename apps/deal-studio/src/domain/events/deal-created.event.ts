import { DomainEvent } from '@daos/shared-kernel';

export class DealCreated extends DomainEvent {
  get eventType(): string { return 'deal.created.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly name: string,
    public readonly assetId: string,
    public readonly sponsorId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
