import { DomainEvent } from '@daos/shared-kernel';

export class MeetingScheduled extends DomainEvent {
  get eventType(): string {
    return 'governance.meeting.scheduled.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly title: string,
    public readonly type: 'annual' | 'special' | 'board' | 'committee',
  ) {
    super(aggregateId, tenantId);
  }
}
