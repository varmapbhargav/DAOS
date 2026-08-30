import { DomainEvent } from '@daos/shared-kernel';

export class TokenMinted extends DomainEvent {
  get eventType(): string {
    return 'issuance.token.minted.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly mintRequestId: string,
    public readonly amountMinorUnits: string,
    public readonly txHash: string,
  ) {
    super(aggregateId, tenantId);
  }
}