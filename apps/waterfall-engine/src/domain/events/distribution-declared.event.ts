import { DomainEvent } from '@daos/shared-kernel';

export class DistributionDeclared extends DomainEvent {
  get eventType(): string {
    return 'distribution.declared.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productId: string,
    public readonly distributionType: string,
    public readonly totalAmount: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
