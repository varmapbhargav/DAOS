import { DomainEvent } from '@daos/shared-kernel';

export class SettlementFailed extends DomainEvent {
  get eventType(): string {
    return 'settlement.failed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly tradeReference: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}
