import { DomainEvent, InteractionDirection, InteractionType } from '@daos/shared-kernel';

export class InteractionRecorded extends DomainEvent {
  get eventType(): string {
    return 'origination-case.interaction-recorded.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly interactionId: string,
    public readonly caseId: string | null,
    public readonly assetId: string | null,
    public readonly counterpartyId: string | null,
    public readonly type: InteractionType,
    public readonly direction: InteractionDirection,
    public readonly subject: string,
    public readonly occurredAt: string,
    public readonly recordedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}