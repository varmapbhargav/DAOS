import { DomainEvent } from '@daos/shared-kernel';

/** @deprecated Use DealCreated instead */
export class DealStructured extends DomainEvent {
  get eventType(): string { return 'deal.structured.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly sponsorId: string,
    public readonly assetId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
