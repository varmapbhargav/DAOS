import { DDRating, DueDiligenceReportId, Finding, TenantId } from '@daos/shared-kernel';

import { DueDiligenceReport } from '../../../domain/entities/due-diligence-report.entity';
import { DueDiligenceReportOrmEntity } from '../entities/due-diligence-report.orm-entity';

export class DueDiligenceReportMapper {
  static toDomain(e: DueDiligenceReportOrmEntity): DueDiligenceReport {
    return DueDiligenceReport.reconstruct({
      id: DueDiligenceReportId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      status: e.status as 'draft' | 'inReview' | 'completed',
      rating: e.rating as DDRating | null,
      findings: e.findings as unknown as Finding[],
      completedBy: e.completedBy,
      completedAt: e.completedAt,
      summary: e.summary,
    });
  }

  static toOrm(domain: DueDiligenceReport): DueDiligenceReportOrmEntity {
    const e = new DueDiligenceReportOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.status = domain.status;
    e.rating = domain.rating;
    e.findings = domain.findings;
    e.completedBy = domain.completedBy;
    e.completedAt = domain.completedAt;
    e.summary = domain.summary;
    e.version = 0;
    return e;
  }
}
