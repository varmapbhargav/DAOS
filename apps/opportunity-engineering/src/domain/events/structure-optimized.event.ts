import { DomainEvent } from '@daos/shared-kernel';

export class StructureOptimized extends DomainEvent {
  get eventType(): string {
    return 'opportunity.structure.optimized.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly scenarioModelId: string,
    public readonly optimizedIrrPercent: number,
  ) {
    super(aggregateId, tenantId);
  }
}
