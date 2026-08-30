import { AggregateRoot, Money, OrderId, OrderSide, OrderStatus, OrderType, TenantId } from '@daos/shared-kernel';

import { OrderCancelled } from '../events/order-cancelled.event';
import { OrderFilled } from '../events/order-filled.event';
import { OrderPartiallyFilled } from '../events/order-partially-filled.event';
import { OrderPlaced } from '../events/order-placed.event';

export type PlaceOrderParams = {
  tenantId: TenantId;
  listingId: string;
  investorId: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: bigint;
  limitPrice: Money | null;
};

export type OrderFill = {
  quantity: bigint;
  price: Money;
  tradeId: string;
};

export class Order extends AggregateRoot {
  private constructor(
    public readonly id: OrderId,
    public readonly tenantId: TenantId,
    private _listingId: string,
    private _investorId: string,
    private _side: OrderSide,
    private _orderType: OrderType,
    private _quantity: bigint,
    private _limitPrice: Money | null,
    private _filledQuantity: bigint,
    private _status: OrderStatus,
    private _placedAt: string,
  ) {
    super();
  }

  static place(params: PlaceOrderParams): Order {
    if (!params.listingId.trim()) throw new Error('Listing id is required');
    if (!params.investorId.trim()) throw new Error('Investor id is required');
    if (params.quantity <= 0n) throw new Error('Order quantity must be positive');
    if ((params.orderType === 'limit' || params.orderType === 'stop') && !params.limitPrice) {
      throw new Error('Limit price is required for limit and stop orders');
    }
    const order = new Order(
      OrderId.create(),
      params.tenantId,
      params.listingId.trim(),
      params.investorId.trim(),
      params.side,
      params.orderType,
      params.quantity,
      params.limitPrice,
      0n,
      'new',
      new Date().toISOString(),
    );
    order.raise(
      new OrderPlaced(
        order.id.value,
        order.tenantId.value,
        order._listingId,
        order._investorId,
        order._side,
        order._orderType,
        order._quantity.toString(),
        order._limitPrice
          ? { amount: order._limitPrice.amount.toString(), currency: order._limitPrice.currency }
          : null,
      ),
    );
    order.incrementVersion();
    return order;
  }

  cancel(): void {
    if (this._status === 'filled') throw new Error('Filled orders cannot be cancelled');
    if (this._status === 'cancelled') throw new Error('Order already cancelled');
    this._status = 'cancelled';
    this.raise(new OrderCancelled(this.id.value, this.tenantId.value, this._listingId));
    this.incrementVersion();
  }

  applyFill(fill: OrderFill): void {
    if (fill.quantity <= 0n) throw new Error('Fill quantity must be positive');
    if (this._status === 'cancelled') throw new Error('Cancelled orders cannot be filled');
    if (fill.quantity > this.openQuantity) throw new Error('Fill exceeds open quantity');
    this._filledQuantity += fill.quantity;
    if (this._filledQuantity >= this._quantity) {
      this._status = 'filled';
      this.raise(new OrderFilled(this.id.value, this.tenantId.value, this._listingId, this._filledQuantity.toString()));
    } else {
      this._status = 'partiallyFilled';
      this.raise(
        new OrderPartiallyFilled(this.id.value, this.tenantId.value, this._listingId, this._filledQuantity.toString()),
      );
    }
    this.incrementVersion();
  }

  get listingId(): string {
    return this._listingId;
  }

  get investorId(): string {
    return this._investorId;
  }

  get side(): OrderSide {
    return this._side;
  }

  get orderType(): OrderType {
    return this._orderType;
  }

  get quantity(): bigint {
    return this._quantity;
  }

  get limitPrice(): Money | null {
    return this._limitPrice;
  }

  get filledQuantity(): bigint {
    return this._filledQuantity;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get placedAt(): string {
    return this._placedAt;
  }

  get openQuantity(): bigint {
    return this._quantity - this._filledQuantity;
  }

  static reconstruct(params: {
    id: OrderId;
    tenantId: TenantId;
    listingId: string;
    investorId: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: bigint;
    limitPrice: Money | null;
    filledQuantity: bigint;
    status: OrderStatus;
    placedAt: string;
    version: number;
  }): Order {
    const order = new Order(
      params.id,
      params.tenantId,
      params.listingId,
      params.investorId,
      params.side,
      params.orderType,
      params.quantity,
      params.limitPrice,
      params.filledQuantity,
      params.status,
      params.placedAt,
    );
    order._version = params.version;
    return order;
  }
}
