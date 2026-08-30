import { DomainEvent } from '@daos/shared-kernel';

export class OpportunityEngineered extends DomainEvent {
  get eventType(): string {
    return 'opportunity.engineered.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
