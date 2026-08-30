import { DomainEvent } from '@daos/shared-kernel';

export class RoleRevoked extends DomainEvent {
  get eventType(): string {
    return 'identity.user.role-revoked.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly roleId: string) {
    super(aggregateId, tenantId);
  }
}
