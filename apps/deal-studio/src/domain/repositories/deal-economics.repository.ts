import { DealEconomicsId, TenantId } from '@daos/shared-kernel';
import { DealEconomics } from '../entities/deal-economics.entity';

export interface DealEconomicsRepository {
  save(economics: DealEconomics): Promise<void>;
  findById(tenantId: TenantId, id: DealEconomicsId): Promise<DealEconomics | null>;
  findByDealId(tenantId: TenantId, dealId: string): Promise<DealEconomics | null>;
}
