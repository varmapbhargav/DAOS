import { DomainEvent } from '@daos/shared-kernel';

export class CorporateActionAnnounced extends DomainEvent {
  get eventType(): string {
    return 'corporate-action.announced.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly issuanceId: string,
    public readonly type: string,
  ) {
    super(aggregateId, tenantId);
  }
}
