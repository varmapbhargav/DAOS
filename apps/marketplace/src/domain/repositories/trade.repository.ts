import { TenantId, TradeId } from '@daos/shared-kernel';

import { Trade } from '../aggregates/trade.aggregate';

export interface TradeRepository {
  save(trade: Trade): Promise<void>;
  findById(tenantId: TenantId, id: TradeId): Promise<Trade | null>;
  findByListingId(tenantId: TenantId, listingId: string): Promise<Trade[]>;
  findAll(tenantId: TenantId): Promise<Trade[]>;
}
