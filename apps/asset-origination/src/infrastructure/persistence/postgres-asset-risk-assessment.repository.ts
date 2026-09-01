import { AssetRiskAssessmentId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AssetRiskAssessment } from '../../domain/entities/asset-risk-assessment.entity';
import { AssetRiskAssessmentRepository } from '../../domain/repositories/asset-risk-assessment.repository';
import { AssetRiskAssessmentOrmEntity } from './entities/asset-risk-assessment.orm-entity';
import { AssetRiskAssessmentMapper } from './mappers/asset-risk-assessment.mapper';

@Injectable()
export class PostgresAssetRiskAssessmentRepository implements AssetRiskAssessmentRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(assessment: AssetRiskAssessment): Promise<void> {
    const orm = AssetRiskAssessmentMapper.toOrm(assessment);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${assessment.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(AssetRiskAssessmentOrmEntity)
        .values(row)
        .orUpdate(['overall_score', 'risk_level', 'assessed_by', 'summary', 'updated_at'], ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: AssetRiskAssessmentId): Promise<AssetRiskAssessment | null> {
    const orm = await this.dataSource.manager.findOne(AssetRiskAssessmentOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? AssetRiskAssessmentMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<AssetRiskAssessment | null> {
    const orm = await this.dataSource.manager.findOne(AssetRiskAssessmentOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
    });
    return orm ? AssetRiskAssessmentMapper.toDomain(orm) : null;
  }
}