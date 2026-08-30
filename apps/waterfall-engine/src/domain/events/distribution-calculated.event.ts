import { DomainEvent } from '@daos/shared-kernel';

export class DistributionCalculated extends DomainEvent {
  get eventType(): string {
    return 'distribution.calculated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productId: string,
    public readonly totalAmount: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
