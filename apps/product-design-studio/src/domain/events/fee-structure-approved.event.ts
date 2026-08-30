import { DomainEvent } from '@daos/shared-kernel';

export class FeeStructureApproved extends DomainEvent {
  get eventType(): string {
    return 'product.fee-structure.approved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly managementFeeAnnual: number,
    public readonly performanceFee: number,
  ) {
    super(aggregateId, tenantId);
  }
}
