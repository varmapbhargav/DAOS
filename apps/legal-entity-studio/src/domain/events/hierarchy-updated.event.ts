import { DomainEvent } from '@daos/shared-kernel';

export class HierarchyUpdated extends DomainEvent {
  get eventType(): string {
    return 'entity.hierarchy.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly parentEntityId: string | null,
    public readonly relationType: string,
  ) {
    super(aggregateId, tenantId);
  }
}