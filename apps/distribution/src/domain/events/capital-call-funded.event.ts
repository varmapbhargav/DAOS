import { DomainEvent, Money } from '@daos/shared-kernel';

export class CapitalCallFunded extends DomainEvent {
  get eventType(): string {
    return 'capital-call.funded.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly amount: Money,
    public readonly totalFunded: Money,
    public readonly status: string,
  ) {
    super(aggregateId, tenantId);
  }
}