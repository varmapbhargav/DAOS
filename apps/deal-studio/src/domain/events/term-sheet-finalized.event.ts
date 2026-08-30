import { DomainEvent } from '@daos/shared-kernel';

export class TermSheetFinalized extends DomainEvent {
  get eventType(): string { return 'deal.term-sheet.finalized.v1'; }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly actorId: string,
    public readonly termSheetId: string,
    public readonly versionNumber: number,
  ) {
    super(aggregateId, tenantId);
  }
}
