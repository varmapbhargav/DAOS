import { DomainEvent } from '@daos/shared-kernel';

export class CounterpartyAdded extends DomainEvent {
  get eventType(): string {
    return 'counterparty.added.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
    public readonly role: string,
  ) {
    super(aggregateId, tenantId);
  }
}