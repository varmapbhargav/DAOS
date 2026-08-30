import { DomainEvent } from '@daos/shared-kernel';

export class InvestorSuspended extends DomainEvent {
  get eventType(): string {
    return 'investor.suspended.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly reason: string) {
    super(aggregateId, tenantId);
  }
}
