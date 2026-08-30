// Marketplace Value Objects
import { Money } from '../index';

export type ListingType = 'primary' | 'secondary';

export type TradingMechanism = 'orderBook' | 'OTCBilateral' | 'auctionBookBuild' | 'RFQ' | 'NAVBased' | 'darkPool';

export type ListingStatus = 'draft' | 'pendingCompliance' | 'active' | 'suspended' | 'delisted';

export type OrderType = 'market' | 'limit' | 'stop' | 'IOC' | 'FOK' | 'GTC';

export type OrderSide = 'buy' | 'sell';

export type OrderStatus = 'new' | 'partiallyFilled' | 'filled' | 'cancelled' | 'rejected' | 'expired';

export type TradeStatus = 'executed' | 'settled' | 'failed';

export type PriceDiscovery = {
  currentPrice: Money;
  lastTradePrice: Money;
  bid: Money;
  ask: Money;
  nav: Money | null;
};

export type MarketSession = {
  openAt: string;
  closeAt: string;
  timezone: string;
};

export type Fill = {
  quantity: bigint;
  price: Money;
  tradeId: string;
};
