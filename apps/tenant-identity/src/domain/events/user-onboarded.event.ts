import { DomainEvent } from '@daos/shared-kernel';

export class UserOnboarded extends DomainEvent {
  get eventType(): string {
    return 'identity.user.onboarded.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly email: string) {
    super(aggregateId, tenantId);
  }
}
