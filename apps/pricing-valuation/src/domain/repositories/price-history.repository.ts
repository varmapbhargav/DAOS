import { TenantId } from '@daos/shared-kernel';

export type PriceHistoryRow = {
  tenantId: string;
  instrumentId: string;
  isin: string;
  currency: string;
  price: string;
  timestamp: string;
};

export interface PriceHistoryRepository {
  append(row: PriceHistoryRow): Promise<void>;
  findBetween(tenantId: TenantId, instrumentId: string, startDate: string, endDate: string): Promise<PriceHistoryRow[]>;
  findAll(tenantId: TenantId, instrumentId: string): Promise<PriceHistoryRow[]>;
}
