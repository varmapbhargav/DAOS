import { DomainEvent } from '@daos/shared-kernel';

export class UsageRecorded extends DomainEvent {
  get eventType(): string {
    return 'organization.usage-recorded.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly apiCalls: number,
    public readonly seatsUsed: number,
  ) {
    super(aggregateId, tenantId);
  }
}
