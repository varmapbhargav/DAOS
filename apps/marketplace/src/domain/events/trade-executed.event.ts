import { DomainEvent } from '@daos/shared-kernel';

export class TradeExecuted extends DomainEvent {
  get eventType(): string {
    return 'trade.executed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly listingId: string,
    public readonly buyOrderId: string,
    public readonly sellOrderId: string,
    public readonly quantity: string,
    public readonly price: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
