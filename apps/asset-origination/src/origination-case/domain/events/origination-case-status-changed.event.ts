import { DomainEvent, OriginationCaseStatus } from '@daos/shared-kernel';

export class OriginationCaseStatusChanged extends DomainEvent {
  get eventType(): string {
    return 'origination-case.status-changed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly previousStatus: OriginationCaseStatus,
    public readonly newStatus: OriginationCaseStatus,
    public readonly reason: string | null,
    public readonly actor: string,
  ) {
    super(aggregateId, tenantId);
  }
}
