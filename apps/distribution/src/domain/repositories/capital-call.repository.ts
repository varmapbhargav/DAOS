import { CapitalCallId, TenantId } from '@daos/shared-kernel';

import { CapitalCall } from '../aggregates/capital-call.aggregate';

export interface CapitalCallRepository {
  save(call: CapitalCall): Promise<void>;
  findById(tenantId: TenantId, id: CapitalCallId): Promise<CapitalCall | null>;
  findByClosingId(tenantId: TenantId, closingId: string): Promise<CapitalCall[]>;
  findAll(tenantId: TenantId): Promise<CapitalCall[]>;
}