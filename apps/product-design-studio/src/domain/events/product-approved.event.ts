import { DomainEvent } from '@daos/shared-kernel';

export class ProductApproved extends DomainEvent {
  get eventType(): string {
    return 'product.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly approvedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}
