import { KycProfileId, TenantId } from '@daos/shared-kernel';

import { KycProfile } from '../entities/kyc-profile.entity';

export interface KycProfileRepository {
  save(profile: KycProfile): Promise<void>;
  findById(tenantId: TenantId, id: KycProfileId): Promise<KycProfile | null>;
  findByInvestorId(tenantId: TenantId, investorId: string): Promise<KycProfile | null>;
}
