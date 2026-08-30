import { DomainEvent } from '@daos/shared-kernel';

export class EntityDissolved extends DomainEvent {
  get eventType(): string {
    return 'entity.dissolved.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}