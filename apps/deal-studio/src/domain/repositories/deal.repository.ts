import { DealId, TenantId } from '@daos/shared-kernel';
import { Deal } from '../aggregates/deal.aggregate';

export interface DealRepository {
  save(deal: Deal): Promise<void>;
  findById(tenantId: TenantId, id: DealId): Promise<Deal | null>;
  findAll(tenantId: TenantId, filter?: {
    name?: string;
    status?: string;
    assetId?: string;
    sponsorId?: string;
    dealType?: string;
    assetClass?: string;
    jurisdiction?: string;
    currency?: string;
    ownerId?: string;
    createdAt?: { gte?: string; lte?: string };
  }): Promise<Deal[]>;
  search(tenantId: TenantId, filters: {
    name?: string;
    dealType?: string;
    status?: string;
    assetClass?: string;
    jurisdiction?: string;
    currency?: string;
    ownerId?: string;
    tag?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ deals: Deal[]; total: number }>;
  countByStatus(tenantId: TenantId): Promise<Record<string, number>>;
}
