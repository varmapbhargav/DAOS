import { EngineeringReadinessId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EngineeringReadinessAssessment } from '../../domain/entities/engineering-readiness-assessment.entity';
import { EngineeringReadinessRepository } from '../../domain/repositories/engineering-readiness.repository';
import { EngineeringReadinessOrmEntity } from './entities/engineering-readiness.orm-entity';
import { EngineeringReadinessMapper } from './mappers/engineering-readiness.mapper';

@Injectable()
export class PostgresEngineeringReadinessRepository implements EngineeringReadinessRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(assessment: EngineeringReadinessAssessment): Promise<void> {
    const orm = EngineeringReadinessMapper.toOrm(assessment);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${assessment.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(EngineeringReadinessOrmEntity)
        .values(row)
        .orUpdate(
          ['status', 'checks', 'assessed_by', 'summary', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: EngineeringReadinessId): Promise<EngineeringReadinessAssessment | null> {
    const orm = await this.dataSource.manager.findOne(EngineeringReadinessOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? EngineeringReadinessMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<EngineeringReadinessAssessment | null> {
    const orm = await this.dataSource.manager.findOne(EngineeringReadinessOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
      order: { assessedAt: 'DESC' } as any,
    });
    return orm ? EngineeringReadinessMapper.toDomain(orm) : null;
  }
}