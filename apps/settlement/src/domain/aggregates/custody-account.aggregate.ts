import { AggregateRoot, CustodyAccountId, CustodyType, Holding, Money, TenantId } from '@daos/shared-kernel';

import { CustodyUpdated } from '../events/custody-updated.event';

export type OpenCustodyParams = {
  tenantId: TenantId;
  investorId: string;
  custodyType: CustodyType;
  custodianRef: string;
};

export type HoldingUpdate = {
  securityId: string;
  quantity: bigint;
  price: Money;
};

export class CustodyAccount extends AggregateRoot {
  private constructor(
    public readonly id: CustodyAccountId,
    public readonly tenantId: TenantId,
    private _investorId: string,
    private _custodyType: CustodyType,
    private _custodianRef: string,
    private _holdings: Holding[],
  ) {
    super();
  }

  static open(params: OpenCustodyParams): CustodyAccount {
    if (!params.investorId.trim()) throw new Error('Investor id is required');
    if (!params.custodianRef.trim()) throw new Error('Custodian reference is required');
    const account = new CustodyAccount(
      CustodyAccountId.create(),
      params.tenantId,
      params.investorId.trim(),
      params.custodyType,
      params.custodianRef.trim(),
      [],
    );
    account.incrementVersion();
    return account;
  }

  creditHolding(update: HoldingUpdate): void {
    if (update.quantity <= 0n) throw new Error('Credit quantity must be positive');
    const existing = this._holdings.find((h) => h.securityId === update.securityId);
    if (existing) {
      const newAvailable = existing.available + update.quantity;
      const newAverage = Money.of(
        (existing.averagePrice.amount * existing.quantity + update.price.amount * update.quantity) /
          (existing.quantity + update.quantity),
        update.price.currency,
      );
      existing.quantity += update.quantity;
      existing.available = newAvailable;
      existing.averagePrice = newAverage;
    } else {
      this._holdings.push({
        securityId: update.securityId,
        quantity: update.quantity,
        available: update.quantity,
        locked: 0n,
        averagePrice: update.price,
      });
    }
    this.raise(new CustodyUpdated(this.id.value, this.tenantId.value, update.securityId, update.quantity.toString()));
    this.incrementVersion();
  }

  debitHolding(securityId: string, quantity: bigint): void {
    if (quantity <= 0n) throw new Error('Debit quantity must be positive');
    const holding = this._holdings.find((h) => h.securityId === securityId);
    if (!holding) throw new Error('Holding not found');
    if (holding.available < quantity) throw new Error('Insufficient available quantity');
    holding.available -= quantity;
    holding.quantity -= quantity;
    this.raise(new CustodyUpdated(this.id.value, this.tenantId.value, securityId, (-quantity).toString()));
    this.incrementVersion();
  }

  lockHolding(securityId: string, quantity: bigint): void {
    if (quantity <= 0n) throw new Error('Lock quantity must be positive');
    const holding = this._holdings.find((h) => h.securityId === securityId);
    if (!holding) throw new Error('Holding not found');
    if (holding.available < quantity) throw new Error('Insufficient available quantity to lock');
    holding.available -= quantity;
    holding.locked += quantity;
    this.incrementVersion();
  }

  get investorId(): string {
    return this._investorId;
  }

  get custodyType(): CustodyType {
    return this._custodyType;
  }

  get custodianRef(): string {
    return this._custodianRef;
  }

  get holdings(): Holding[] {
    return this._holdings.map((h) => ({ ...h, averagePrice: h.averagePrice }));
  }

  getHolding(securityId: string): Holding | null {
    const holding = this._holdings.find((h) => h.securityId === securityId);
    return holding ? { ...holding } : null;
  }

  static reconstruct(params: {
    id: CustodyAccountId;
    tenantId: TenantId;
    investorId: string;
    custodyType: CustodyType;
    custodianRef: string;
    holdings: Holding[];
    version: number;
  }): CustodyAccount {
    const account = new CustodyAccount(
      params.id,
      params.tenantId,
      params.investorId,
      params.custodyType,
      params.custodianRef,
      params.holdings,
    );
    account._version = params.version;
    return account;
  }
}
