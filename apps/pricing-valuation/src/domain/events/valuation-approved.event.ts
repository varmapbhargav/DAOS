import { DomainEvent } from '@daos/shared-kernel';

export class ValuationApproved extends DomainEvent {
  get eventType(): string {
    return 'valuation.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assetId: string,
    public readonly value: { amount: string; currency: string },
  ) {
    super(aggregateId, tenantId);
  }
}
