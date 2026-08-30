import { AggregateRoot, Money, TenantId, TradeId, TradeStatus } from '@daos/shared-kernel';

import { TradeExecuted } from '../events/trade-executed.event';

export type ExecuteTradeParams = {
  tenantId: TenantId;
  listingId: string;
  buyOrderId: string;
  sellOrderId: string;
  quantity: bigint;
  price: Money;
};

export class Trade extends AggregateRoot {
  private constructor(
    public readonly id: TradeId,
    public readonly tenantId: TenantId,
    private _listingId: string,
    private _buyOrderId: string,
    private _sellOrderId: string,
    private _quantity: bigint,
    private _price: Money,
    private _status: TradeStatus,
    private _executedAt: string,
  ) {
    super();
  }

  static execute(params: ExecuteTradeParams): Trade {
    if (!params.listingId.trim()) throw new Error('Listing id is required');
    if (!params.buyOrderId.trim() || !params.sellOrderId.trim()) throw new Error('Both order ids are required');
    if (params.quantity <= 0n) throw new Error('Trade quantity must be positive');
    if (params.price.amount <= 0n) throw new Error('Trade price must be positive');
    const trade = new Trade(
      TradeId.create(),
      params.tenantId,
      params.listingId.trim(),
      params.buyOrderId.trim(),
      params.sellOrderId.trim(),
      params.quantity,
      params.price,
      'executed',
      new Date().toISOString(),
    );
    trade.raise(
      new TradeExecuted(
        trade.id.value,
        trade.tenantId.value,
        trade._listingId,
        trade._buyOrderId,
        trade._sellOrderId,
        trade._quantity.toString(),
        { amount: trade._price.amount.toString(), currency: trade._price.currency },
      ),
    );
    trade.incrementVersion();
    return trade;
  }

  markSettled(): void {
    if (this._status !== 'executed') throw new Error('Only executed trades can be settled');
    this._status = 'settled';
    this.incrementVersion();
  }

  markFailed(): void {
    if (this._status === 'settled') throw new Error('Settled trades cannot be marked failed');
    this._status = 'failed';
    this.incrementVersion();
  }

  get listingId(): string {
    return this._listingId;
  }

  get buyOrderId(): string {
    return this._buyOrderId;
  }

  get sellOrderId(): string {
    return this._sellOrderId;
  }

  get quantity(): bigint {
    return this._quantity;
  }

  get price(): Money {
    return this._price;
  }

  get status(): TradeStatus {
    return this._status;
  }

  get executedAt(): string {
    return this._executedAt;
  }

  static reconstruct(params: {
    id: TradeId;
    tenantId: TenantId;
    listingId: string;
    buyOrderId: string;
    sellOrderId: string;
    quantity: bigint;
    price: Money;
    status: TradeStatus;
    executedAt: string;
    version: number;
  }): Trade {
    const trade = new Trade(
      params.id,
      params.tenantId,
      params.listingId,
      params.buyOrderId,
      params.sellOrderId,
      params.quantity,
      params.price,
      params.status,
      params.executedAt,
    );
    trade._version = params.version;
    return trade;
  }
}
