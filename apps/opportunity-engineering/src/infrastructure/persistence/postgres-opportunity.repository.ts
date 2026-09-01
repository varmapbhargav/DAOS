import { OpportunityId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Opportunity } from '../../domain/aggregates/opportunity.aggregate';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { OpportunityOrmEntity } from './entities/opportunity.orm-entity';
import { OpportunityMapper } from './mappers/opportunity.mapper';

@Injectable()
export class PostgresOpportunityRepository implements OpportunityRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(opportunity: Opportunity): Promise<void> {
    const orm = OpportunityMapper.toOrm(opportunity);
    const expectedVersion = opportunity.version - 1;
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = $1`, [opportunity.tenantId.value]);
      const result = await manager
        .getRepository(OpportunityOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(OpportunityOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'asset_id',
            'name',
            'sponsor_id',
            'status',
            'target_return',
            'score',
            'sensitivity_factors',
            'scenario_model_ids',
            'approved_scenario_id',
            'approved_by',
            'rejection_reason',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();

      if (expectedVersion > 0) {
        const updated = await manager
          .createQueryBuilder()
          .update(OpportunityOrmEntity)
          .set({ version: orm.version, updatedAt: new Date() })
          .where('id = :id AND version = :expectedVersion', { id: orm.id, expectedVersion })
          .execute();

        if (updated.affected === 0) {
          throw new Error('Optimistic lock failed: opportunity was modified by another process');
        }
      }
    });
  }

  async findById(tenantId: TenantId, id: OpportunityId): Promise<Opportunity | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = $1`, [tenantId.value]);
      return manager
        .getRepository(OpportunityOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? OpportunityMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Opportunity[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = $1`, [tenantId.value]);
      return manager.getRepository(OpportunityOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(OpportunityMapper.toDomain);
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<Opportunity | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = $1`, [tenantId.value]);
      return manager
        .getRepository(OpportunityOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, assetId } });
    });
    return e ? OpportunityMapper.toDomain(e) : null;
  }
}
