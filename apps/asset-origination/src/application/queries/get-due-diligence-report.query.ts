import { DueDiligenceReportDto } from '@daos/asset-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DueDiligenceReportRepository } from '../../domain/repositories/due-diligence-report.repository';
import { DUE_DILIGENCE_REPORT_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class GetDueDiligenceReportQuery {
  constructor(public readonly assetId: string) {}
}

@QueryHandler(GetDueDiligenceReportQuery)
export class GetDueDiligenceReportHandler
  implements IQueryHandler<GetDueDiligenceReportQuery, DueDiligenceReportDto | null>
{
  constructor(
    @Inject(DUE_DILIGENCE_REPORT_REPOSITORY) private readonly reports: DueDiligenceReportRepository,
  ) {}

  async execute(query: GetDueDiligenceReportQuery): Promise<DueDiligenceReportDto | null> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const report = await this.reports.findByAssetId(tenantId, query.assetId);
    if (!report) return null;

    return {
      id: report.id.value,
      tenantId: report.tenantId.value,
      assetId: report.assetId,
      status: report.status,
      rating: report.rating,
      findings: report.findings,
      completedBy: report.completedBy,
      completedAt: report.completedAt,
      summary: report.summary,
      createdAt: new Date().toISOString(),
    };
  }
}
