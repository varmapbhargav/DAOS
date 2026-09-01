import { RiskItemId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { RiskItem } from '../../domain/entities/risk-item.entity';
import { RiskItemRepository } from '../../domain/repositories/risk-item.repository';
import { RiskItemOrmEntity } from './entities/risk-item.orm-entity';
import { RiskItemMapper } from './mappers/risk-item.mapper';

@Injectable()
export class PostgresRiskItemRepository implements RiskItemRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(item: RiskItem): Promise<void> {
    const orm = RiskItemMapper.toOrm(item);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${item.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(RiskItemOrmEntity)
        .values(row)
        .orUpdate(
          ['category', 'description', 'probability', 'impact', 'score', 'mitigation', 'owner', 'due_date', 'evidence', 'status', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: RiskItemId): Promise<RiskItem | null> {
    const orm = await this.dataSource.manager.findOne(RiskItemOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? RiskItemMapper.toDomain(orm) : null;
  }

  async findByAssessmentId(tenantId: TenantId, assessmentId: string): Promise<RiskItem[]> {
    const orms = await this.dataSource.manager.find(RiskItemOrmEntity, {
      where: { assessmentId, tenantId: tenantId.value },
      order: { createdAt: 'ASC' } as any,
    });
    return orms.map(RiskItemMapper.toDomain);
  }
}