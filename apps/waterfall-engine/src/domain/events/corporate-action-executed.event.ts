import { DomainEvent } from '@daos/shared-kernel';

export class CorporateActionExecuted extends DomainEvent {
  get eventType(): string {
    return 'corporate-action.executed.v1';
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
