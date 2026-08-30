import { DomainEvent } from '@daos/shared-kernel';

export class DistributionApproved extends DomainEvent {
  get eventType(): string {
    return 'distribution.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
