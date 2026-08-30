import { DomainEvent } from '@daos/shared-kernel';

export class PriceUpdated extends DomainEvent {
  get eventType(): string {
    return 'price.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly isin: string,
    public readonly price: { amount: string; currency: string },
    public readonly source: string,
  ) {
    super(aggregateId, tenantId);
  }
}
