import { DomainEvent } from '@daos/shared-kernel';

export class DistributionPaid extends DomainEvent {
  get eventType(): string {
    return 'distribution.paid.v1';
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
