import { DomainEvent } from '@daos/shared-kernel';

export class InvestorApproved extends DomainEvent {
  get eventType(): string {
    return 'investor.approved.v1';
  }

  constructor(aggregateId: string, tenantId: string) {
    super(aggregateId, tenantId);
  }
}
