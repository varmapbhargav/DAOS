import { CustodyAccountId, TenantId } from '@daos/shared-kernel';

import { CustodyAccount } from '../aggregates/custody-account.aggregate';

export interface CustodyAccountRepository {
  save(account: CustodyAccount): Promise<void>;
  findById(tenantId: TenantId, id: CustodyAccountId): Promise<CustodyAccount | null>;
  findByInvestorId(tenantId: TenantId, investorId: string): Promise<CustodyAccount | null>;
}
