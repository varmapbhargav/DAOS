import { DomainEvent } from '@daos/shared-kernel';

export class WaterfallModelApproved extends DomainEvent {
  get eventType(): string {
    return 'waterfall.model-approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly modelName: string,
  ) {
    super(aggregateId, tenantId);
  }
}
