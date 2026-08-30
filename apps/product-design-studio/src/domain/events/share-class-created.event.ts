import { DomainEvent } from '@daos/shared-kernel';

export class ShareClassCreated extends DomainEvent {
  get eventType(): string {
    return 'product.share-class.created.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly shareClassId: string,
    public readonly productId: string,
    public readonly name: string,
    public readonly currency: string,
  ) {
    super(aggregateId, tenantId);
  }
}
