import { DomainEvent } from '@daos/shared-kernel';

export class StalePriceDetected extends DomainEvent {
  get eventType(): string {
    return 'price.stale-detected.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly isin: string,
    public readonly price: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
