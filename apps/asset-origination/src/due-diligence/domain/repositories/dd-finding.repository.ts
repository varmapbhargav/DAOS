import { DdFindingId, TenantId } from '@daos/shared-kernel';

import { DdFinding } from '../entities/dd-finding.entity';

export interface DdFindingRepository {
  save(finding: DdFinding): Promise<void>;
  findById(tenantId: TenantId, id: DdFindingId): Promise<DdFinding | null>;
  findByDdCaseId(tenantId: TenantId, ddCaseId: string): Promise<DdFinding[]>;
}