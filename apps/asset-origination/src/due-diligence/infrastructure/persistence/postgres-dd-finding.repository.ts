import { DdFindingId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DdFinding } from '../../domain/entities/dd-finding.entity';
import { DdFindingRepository } from '../../domain/repositories/dd-finding.repository';
import { DdFindingOrmEntity } from './entities/dd-finding.orm-entity';
import { DdFindingMapper } from './mappers/dd-finding.mapper';

@Injectable()
export class PostgresDdFindingRepository implements DdFindingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(finding: DdFinding): Promise<void> {
    const orm = DdFindingMapper.toOrm(finding);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${finding.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(DdFindingOrmEntity)
        .values(row)
        .orUpdate(
          [
            'category',
            'severity',
            'description',
            'evidence',
            'impact',
            'recommendation',
            'remediation',
            'owner',
            'due_date',
            'status',
            'reviewer',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DdFindingId): Promise<DdFinding | null> {
    const orm = await this.dataSource.manager.findOne(DdFindingOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? DdFindingMapper.toDomain(orm) : null;
  }

  async findByDdCaseId(tenantId: TenantId, ddCaseId: string): Promise<DdFinding[]> {
    const orms = await this.dataSource.manager.find(DdFindingOrmEntity, {
      where: { ddCaseId, tenantId: tenantId.value },
      order: { createdAt: 'ASC' } as any,
    });
    return orms.map(DdFindingMapper.toDomain);
  }
}