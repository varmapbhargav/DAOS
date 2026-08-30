import { DomainEvent } from '@daos/shared-kernel';

export class WalletLinked extends DomainEvent {
  get eventType(): string {
    return 'investor.wallet.linked.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly walletId: string,
    public readonly address: string,
  ) {
    super(aggregateId, tenantId);
  }
}
