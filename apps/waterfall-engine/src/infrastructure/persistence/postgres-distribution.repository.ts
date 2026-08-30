import { DistributionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Distribution } from '../../domain/aggregates/distribution.aggregate';
import { DistributionRepository } from '../../domain/repositories/distribution.repository';
import { DistributionOrmEntity } from './entities/waterfall.orm-entities';
import { distributionFromOrm, distributionToOrm } from './mappers/waterfall-persistence.mapper';

const UPSERT_COLUMNS = [
  'product_id',
  'distribution_type',
  'currency',
  'total_amount',
  'record_date',
  'payment_date',
  'status',
  'investor_distributions',
  'promote',
  'carried_interest',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresDistributionRepository implements DistributionRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(distribution: Distribution): Promise<void> {
    const orm = distributionToOrm(distribution);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${distribution.tenantId.value}'`);
      await manager
        .getRepository(DistributionOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DistributionOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DistributionId): Promise<Distribution | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DistributionOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? distributionFromOrm(e) : null;
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<Distribution[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DistributionOrmEntity).find({
        where: { tenantId: tenantId.value, productId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(distributionFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<Distribution[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DistributionOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(distributionFromOrm);
  }

  async findByStatus(tenantId: TenantId, status: string): Promise<Distribution[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DistributionOrmEntity).find({
        where: { tenantId: tenantId.value, status },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(distributionFromOrm);
  }
}
