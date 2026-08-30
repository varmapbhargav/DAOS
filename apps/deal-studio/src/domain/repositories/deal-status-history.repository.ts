import { TenantId } from '@daos/shared-kernel';
import { DealStatusHistory } from '../entities/deal-status-history.entity';

export interface DealStatusHistoryRepository {
  saveAll(entries: DealStatusHistory[]): Promise<void>;
  findByDealId(tenantId: TenantId, dealId: string): Promise<DealStatusHistory[]>;
}
