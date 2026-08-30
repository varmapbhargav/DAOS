import { ListingStatus, ListingType, MarketSession, OrderSide, OrderStatus, OrderType, TradeStatus, TradingMechanism } from '@daos/shared-kernel';

import { Listing } from '../domain/aggregates/listing.aggregate';
import { Order } from '../domain/aggregates/order.aggregate';
import { Trade } from '../domain/aggregates/trade.aggregate';
import { toMoneyDto } from './money.mapper';

export interface ListingDto {
  id: string;
  tenantId: string;
  productId: string;
  issueId: string | null;
  listingType: ListingType;
  mechanism: TradingMechanism;
  currency: string;
  status: ListingStatus;
  totalQuantity: string;
  minimumQuantity: string;
  referencePrice: { amount: string; currency: string } | null;
  session: MarketSession;
  version: number;
}

export interface OrderDto {
  id: string;
  tenantId: string;
  listingId: string;
  investorId: string;
  side: OrderSide;
  orderType: OrderType;
  status: OrderStatus;
  quantity: string;
  filledQuantity: string;
  openQuantity: string;
  limitPrice: { amount: string; currency: string } | null;
  placedAt: string;
  version: number;
}

export interface TradeDto {
  id: string;
  tenantId: string;
  listingId: string;
  buyOrderId: string;
  sellOrderId: string;
  quantity: string;
  price: { amount: string; currency: string };
  status: TradeStatus;
  executedAt: string;
  version: number;
}

export interface OrderBookDto {
  listingId: string;
  bids: OrderDto[];
  asks: OrderDto[];
}

export function toListingDto(listing: Listing): ListingDto {
  return {
    id: listing.id.value,
    tenantId: listing.tenantId.value,
    productId: listing.productId,
    issueId: listing.issueId,
    listingType: listing.listingType,
    mechanism: listing.mechanism,
    currency: listing.currency,
    status: listing.status,
    totalQuantity: listing.totalQuantity.toString(),
    minimumQuantity: listing.minimumQuantity.toString(),
    referencePrice: listing.referencePrice ? toMoneyDto(listing.referencePrice) : null,
    session: listing.session,
    version: listing.version,
  };
}

export function toOrderDto(order: Order): OrderDto {
  return {
    id: order.id.value,
    tenantId: order.tenantId.value,
    listingId: order.listingId,
    investorId: order.investorId,
    side: order.side,
    orderType: order.orderType,
    status: order.status,
    quantity: order.quantity.toString(),
    filledQuantity: order.filledQuantity.toString(),
    openQuantity: order.openQuantity.toString(),
    limitPrice: order.limitPrice ? toMoneyDto(order.limitPrice) : null,
    placedAt: order.placedAt,
    version: order.version,
  };
}

export function toTradeDto(trade: Trade): TradeDto {
  return {
    id: trade.id.value,
    tenantId: trade.tenantId.value,
    listingId: trade.listingId,
    buyOrderId: trade.buyOrderId,
    sellOrderId: trade.sellOrderId,
    quantity: trade.quantity.toString(),
    price: toMoneyDto(trade.price),
    status: trade.status,
    executedAt: trade.executedAt,
    version: trade.version,
  };
}

export function toOrderBookDto(listingId: string, orders: Order[]): OrderBookDto {
  const bids = orders.filter((o) => o.side === 'buy');
  const asks = orders.filter((o) => o.side === 'sell');
  return {
    listingId,
    bids: bids.map(toOrderDto),
    asks: asks.map(toOrderDto),
  };
}
