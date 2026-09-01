import { OriginationCaseId, TenantId } from '@daos/shared-kernel';

import { OriginationCase } from '../aggregates/origination-case.aggregate';

export interface OriginationCaseRepository {
  save(origin: OriginationCase): Promise<void>;
  findById(tenantId: TenantId, id: OriginationCaseId): Promise<OriginationCase | null>;
  findByCaseNumber(tenantId: TenantId, caseNumber: string): Promise<OriginationCase | null>;
  findAll(tenantId: TenantId): Promise<OriginationCase[]>;
}
