import { EvidenceId, TenantId } from '@daos/shared-kernel';

import { Evidence } from '../entities/evidence.entity';

export interface EvidenceRepository {
  save(evidence: Evidence): Promise<void>;
  findById(tenantId: TenantId, id: EvidenceId): Promise<Evidence | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<Evidence[]>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<Evidence[]>;
}
