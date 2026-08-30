import { DomainEvent } from '@daos/shared-kernel';

export class ValuationUpdated extends DomainEvent {
  get eventType(): string {
    return 'asset.valuation.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly fairValueMinorUnits: string,
    public readonly methodology: string,
  ) {
    super(aggregateId, tenantId);
  }
}
