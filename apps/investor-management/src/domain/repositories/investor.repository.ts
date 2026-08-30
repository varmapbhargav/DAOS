import { Email, InvestorId, TenantId } from '@daos/shared-kernel';

import { Investor } from '../aggregates/investor.aggregate';

export interface InvestorRepository {
  save(investor: Investor): Promise<void>;
  findById(tenantId: TenantId, id: InvestorId): Promise<Investor | null>;
  findByEmail(tenantId: TenantId, email: Email): Promise<Investor | null>;
  findByUserId(tenantId: TenantId, userId: string): Promise<Investor | null>;
  findAll(tenantId: TenantId): Promise<Investor[]>;
}
