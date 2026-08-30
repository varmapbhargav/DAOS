import { DomainEvent } from '@daos/shared-kernel';

export class ProductDesigned extends DomainEvent {
  get eventType(): string {
    return 'product.designed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productType: string,
  ) {
    super(aggregateId, tenantId);
  }
}
