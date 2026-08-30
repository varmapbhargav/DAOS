import { DomainEvent } from '@daos/shared-kernel';

export class ProductClosed extends DomainEvent {
  get eventType(): string {
    return 'product.closed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
