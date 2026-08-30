import {
  ListingId,
  ListingStatus,
  ListingType,
  MarketSession,
  Money,
  OrderId,
  OrderSide,
  OrderStatus,
  OrderType,
  TenantId,
  TradeId,
  TradeStatus,
  TradingMechanism,
} from '@daos/shared-kernel';

import { Listing } from '../../../domain/aggregates/listing.aggregate';
import { Order } from '../../../domain/aggregates/order.aggregate';
import { Trade } from '../../../domain/aggregates/trade.aggregate';
import {
  ListingOrmEntity,
  OrderOrmEntity,
  TradeOrmEntity,
} from '../entities/marketplace.orm-entities';

type MoneyRow = { amount: string; currency: string };

function moneyToRow(money: Money): MoneyRow {
  return { amount: money.amount.toString(), currency: money.currency };
}

function moneyFromRow(row: MoneyRow): Money {
  return Money.of(BigInt(row.amount), row.currency);
}

export function listingToOrm(l: Listing): Partial<ListingOrmEntity> {
  return {
    id: l.id.value,
    tenantId: l.tenantId.value,
    productId: l.productId,
    issueId: l.issueId,
    listingType: l.listingType,
    mechanism: l.mechanism,
    currency: l.currency,
    status: l.status,
    totalQuantity: l.totalQuantity.toString(),
    minimumQuantity: l.minimumQuantity.toString(),
    referencePrice: l.referencePrice ? (moneyToRow(l.referencePrice) as unknown as object) : null,
    session: { ...l.session } as unknown as object,
    version: l.version,
  };
}

export function listingFromOrm(e: ListingOrmEntity): Listing {
  return Listing.reconstruct({
    id: ListingId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    productId: e.productId,
    issueId: e.issueId,
    listingType: e.listingType as ListingType,
    mechanism: e.mechanism as TradingMechanism,
    currency: e.currency,
    totalQuantity: BigInt(e.totalQuantity),
    minimumQuantity: BigInt(e.minimumQuantity),
    referencePrice: e.referencePrice ? moneyFromRow(e.referencePrice as MoneyRow) : null,
    session: (e.session ?? { openAt: '', closeAt: '', timezone: '' }) as MarketSession,
    status: e.status as ListingStatus,
    version: e.version,
  });
}

export function orderToOrm(o: Order): Partial<OrderOrmEntity> {
  return {
    id: o.id.value,
    tenantId: o.tenantId.value,
    listingId: o.listingId,
    investorId: o.investorId,
    side: o.side,
    orderType: o.orderType,
    status: o.status,
    quantity: o.quantity.toString(),
    filledQuantity: o.filledQuantity.toString(),
    limitPrice: o.limitPrice ? (moneyToRow(o.limitPrice) as unknown as object) : null,
    placedAt: new Date(o.placedAt),
    version: o.version,
  };
}

export function orderFromOrm(e: OrderOrmEntity): Order {
  return Order.reconstruct({
    id: OrderId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    listingId: e.listingId,
    investorId: e.investorId,
    side: e.side as OrderSide,
    orderType: e.orderType as OrderType,
    quantity: BigInt(e.quantity),
    limitPrice: e.limitPrice ? moneyFromRow(e.limitPrice as MoneyRow) : null,
    filledQuantity: BigInt(e.filledQuantity),
    status: e.status as OrderStatus,
    placedAt: e.placedAt.toISOString(),
    version: e.version,
  });
}

export function tradeToOrm(t: Trade): Partial<TradeOrmEntity> {
  return {
    id: t.id.value,
    tenantId: t.tenantId.value,
    listingId: t.listingId,
    buyOrderId: t.buyOrderId,
    sellOrderId: t.sellOrderId,
    quantity: t.quantity.toString(),
    price: moneyToRow(t.price) as unknown as object,
    status: t.status,
    executedAt: new Date(t.executedAt),
    version: t.version,
  };
}

export function tradeFromOrm(e: TradeOrmEntity): Trade {
  return Trade.reconstruct({
    id: TradeId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    listingId: e.listingId,
    buyOrderId: e.buyOrderId,
    sellOrderId: e.sellOrderId,
    quantity: BigInt(e.quantity),
    price: moneyFromRow(e.price as MoneyRow),
    status: e.status as TradeStatus,
    executedAt: e.executedAt.toISOString(),
    version: e.version,
  });
}
