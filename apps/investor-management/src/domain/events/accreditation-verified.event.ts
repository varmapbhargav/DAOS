import { DomainEvent } from '@daos/shared-kernel';

import { AccreditationLevel } from '@daos/shared-kernel';

export class AccreditationVerified extends DomainEvent {
  get eventType(): string {
    return 'investor.accreditation.verified.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly level: AccreditationLevel,
    public readonly expiresAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}
