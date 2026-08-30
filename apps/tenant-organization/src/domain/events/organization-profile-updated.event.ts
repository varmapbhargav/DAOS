import { DomainEvent } from '@daos/shared-kernel';

export class OrganizationProfileUpdated extends DomainEvent {
  get eventType(): string {
    return 'organization.profile-updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly orgName: string,
  ) {
    super(aggregateId, tenantId);
  }
}
