import { DomainEvent } from '@daos/shared-kernel';

export class CashFlowModelUpdated extends DomainEvent {
  get eventType(): string {
    return 'cash-flow-model.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
