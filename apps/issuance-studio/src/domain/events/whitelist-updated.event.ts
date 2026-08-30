import { DomainEvent } from '@daos/shared-kernel';

export class WhitelistUpdated extends DomainEvent {
  get eventType(): string {
    return 'issuance.whitelist.updated.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly walletAddress: string,
    public readonly action: 'add' | 'remove',
  ) {
    super(aggregateId, tenantId);
  }
}