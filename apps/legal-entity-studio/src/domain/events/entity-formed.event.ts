import { DomainEvent } from '@daos/shared-kernel';

export class EntityFormed extends DomainEvent {
  get eventType(): string {
    return 'entity.formed.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly legalName: string,
    public readonly entityType: string,
    public readonly jurisdiction: string,
    public readonly formationRef: string | null,
  ) {
    super(aggregateId, tenantId);
  }
}