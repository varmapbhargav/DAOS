import { DomainEvent } from '@daos/shared-kernel';

export class PromoteDistributed extends DomainEvent {
  get eventType(): string {
    return 'promote.distributed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly productId: string,
    public readonly promoteAmount: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
