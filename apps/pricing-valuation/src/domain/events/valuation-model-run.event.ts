import { DomainEvent } from '@daos/shared-kernel';

export class ValuationModelRun extends DomainEvent {
  get eventType(): string {
    return 'valuation.model-run.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
    public readonly value: { amount: string; currency: string },
    public readonly reportId: string,
  ) {
    super(aggregateId, tenantId);
  }
}
