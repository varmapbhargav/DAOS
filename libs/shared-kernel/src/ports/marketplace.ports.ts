// Marketplace infrastructure ports.
// External-provider ports used by the marketplace bounded context.
// Repository interfaces and domain services (OrderMatchingEngine, CompliancePreTradeCheck)
// live in-app (see apps/marketplace/src/domain).
import { Money } from '../index';

export interface MarketDataPort {
  getPrice(listingId: string): Promise<Money>;
  getOrderBookDepth(listingId: string): Promise<{ bids: unknown[]; asks: unknown[] }>;
}
