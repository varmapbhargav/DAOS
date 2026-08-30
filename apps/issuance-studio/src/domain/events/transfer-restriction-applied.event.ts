import { DomainEvent } from '@daos/shared-kernel';

export class TransferRestrictionApplied extends DomainEvent {
  get eventType(): string {
    return 'issuance.transfer-restriction.applied.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly restrictionType: string,
  ) {
    super(aggregateId, tenantId);
  }
}