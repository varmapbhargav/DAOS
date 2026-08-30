import { DomainEvent } from '@daos/shared-kernel';

export class AccreditationExpired extends DomainEvent {
  get eventType(): string {
    return 'investor.accreditation.expired.v1';
  }

  constructor(aggregateId: string, tenantId: string) {
    super(aggregateId, tenantId);
  }
}
