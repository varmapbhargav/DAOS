import { DomainEvent } from '@daos/shared-kernel';

export class TradeSettled extends DomainEvent {
  get eventType(): string {
    return 'trade.settled.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly tradeReference: string,
    public readonly settledAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}
