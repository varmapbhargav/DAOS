import { DomainEvent } from '@daos/shared-kernel';

export class IssuanceCreated extends DomainEvent {
  get eventType(): string {
    return 'issuance.created.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly name: string,
    public readonly instrumentType: string,
    public readonly network: string,
    public readonly capTableId: string | null,
  ) {
    super(aggregateId, tenantId);
  }
}