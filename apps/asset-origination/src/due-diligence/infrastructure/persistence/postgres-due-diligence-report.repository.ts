import { DueDiligenceReportId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DueDiligenceReport } from '../../domain/entities/due-diligence-report.entity';
import { DueDiligenceReportRepository } from '../../domain/repositories/due-diligence-report.repository';
import { DueDiligenceReportOrmEntity } from './entities/due-diligence-report.orm-entity';
import { DueDiligenceReportMapper } from './mappers/due-diligence-report.mapper';

@Injectable()
export class PostgresDueDiligenceReportRepository implements DueDiligenceReportRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(report: DueDiligenceReport): Promise<void> {
    const orm = DueDiligenceReportMapper.toOrm(report);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${report.tenantId.value}'`);
      await manager
        .getRepository(DueDiligenceReportOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DueDiligenceReportOrmEntity)
        .values(orm)
        .orUpdate(
          ['status', 'rating', 'findings', 'completed_by', 'completed_at', 'summary'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DueDiligenceReportId): Promise<DueDiligenceReport | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(DueDiligenceReportOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? DueDiligenceReportMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<DueDiligenceReport | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(DueDiligenceReportOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, assetId } });
    });
    return e ? DueDiligenceReportMapper.toDomain(e) : null;
  }
}
