import { DomainEvent, Money } from '@daos/shared-kernel';

export class AllocationApproved extends DomainEvent {
  get eventType(): string {
    return 'allocation.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly subscriptionId: string,
    public readonly requestedAmount: Money,
    public readonly allocatedAmount: Money,
    public readonly allocationPct: number,
  ) {
    super(aggregateId, tenantId);
  }
}