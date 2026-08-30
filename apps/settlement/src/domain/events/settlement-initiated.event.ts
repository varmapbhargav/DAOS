import { DomainEvent } from '@daos/shared-kernel';

export class SettlementInitiated extends DomainEvent {
  get eventType(): string {
    return 'settlement.initiated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly tradeReference: string,
    public readonly settlementType: string,
    public readonly settlementDate: string,
  ) {
    super(aggregateId, tenantId);
  }
}
