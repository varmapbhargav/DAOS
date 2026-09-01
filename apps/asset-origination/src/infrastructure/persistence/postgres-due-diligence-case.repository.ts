import { DueDiligenceCaseId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DueDiligenceCase } from '../../domain/entities/due-diligence-case.entity';
import { DueDiligenceCaseRepository } from '../../domain/repositories/due-diligence-case.repository';
import { DueDiligenceCaseOrmEntity } from './entities/due-diligence-case.orm-entity';
import { DueDiligenceCaseMapper } from './mappers/due-diligence-case.mapper';

@Injectable()
export class PostgresDueDiligenceCaseRepository implements DueDiligenceCaseRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(ddCase: DueDiligenceCase): Promise<void> {
    const orm = DueDiligenceCaseMapper.toOrm(ddCase);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${ddCase.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(DueDiligenceCaseOrmEntity)
        .values(row)
        .orUpdate(
          ['status', 'checklist', 'reviewers', 'due_date', 'completed_at', 'summary', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DueDiligenceCaseId): Promise<DueDiligenceCase | null> {
    const orm = await this.dataSource.manager.findOne(DueDiligenceCaseOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? DueDiligenceCaseMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<DueDiligenceCase | null> {
    const orm = await this.dataSource.manager.findOne(DueDiligenceCaseOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
    });
    return orm ? DueDiligenceCaseMapper.toDomain(orm) : null;
  }
}