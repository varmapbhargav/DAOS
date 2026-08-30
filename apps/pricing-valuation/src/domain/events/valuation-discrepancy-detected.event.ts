import { DomainEvent } from '@daos/shared-kernel';

export class ValuationDiscrepancyDetected extends DomainEvent {
  get eventType(): string {
    return 'valuation.discrepancy-detected.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
    public readonly comparatorValue: { amount: string; currency: string },
    public readonly modelValue: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
