import { DueDiligenceReportId, TenantId } from '@daos/shared-kernel';

import { DueDiligenceReport } from '../entities/due-diligence-report.entity';

export interface DueDiligenceReportRepository {
  save(report: DueDiligenceReport): Promise<void>;
  findById(tenantId: TenantId, id: DueDiligenceReportId): Promise<DueDiligenceReport | null>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<DueDiligenceReport | null>;
}
