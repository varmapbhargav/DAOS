import { DomainEvent } from '@daos/shared-kernel';

export class EntityActivated extends DomainEvent {
  get eventType(): string {
    return 'entity.activated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly activatedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}