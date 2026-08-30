import { DomainEvent } from '@daos/shared-kernel';

export class RoleAssigned extends DomainEvent {
  get eventType(): string {
    return 'identity.user.role-assigned.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly roleId: string) {
    super(aggregateId, tenantId);
  }
}
