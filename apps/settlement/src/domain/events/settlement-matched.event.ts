import { DomainEvent } from '@daos/shared-kernel';

export class SettlementMatched extends DomainEvent {
  get eventType(): string {
    return 'settlement.matched.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly tradeReference: string,
    public readonly matchedAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}
