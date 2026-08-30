import { TenantId, WaterfallModelId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { WaterfallModel } from '../../domain/aggregates/waterfall-model.aggregate';
import { WaterfallModelRepository } from '../../domain/repositories/waterfall-model.repository';
import { WaterfallModelOrmEntity } from './entities/waterfall.orm-entities';
import { waterfallModelFromOrm, waterfallModelToOrm } from './mappers/waterfall-persistence.mapper';

const UPSERT_COLUMNS = [
  'product_id',
  'name',
  'waterfall_type',
  'status',
  'tiers',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresWaterfallModelRepository implements WaterfallModelRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(model: WaterfallModel): Promise<void> {
    const orm = waterfallModelToOrm(model);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${model.tenantId.value}'`);
      await manager
        .getRepository(WaterfallModelOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(WaterfallModelOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: WaterfallModelId): Promise<WaterfallModel | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(WaterfallModelOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? waterfallModelFromOrm(e) : null;
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<WaterfallModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(WaterfallModelOrmEntity).find({
        where: { tenantId: tenantId.value, productId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(waterfallModelFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<WaterfallModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(WaterfallModelOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(waterfallModelFromOrm);
  }

  async findApproved(tenantId: TenantId): Promise<WaterfallModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(WaterfallModelOrmEntity).find({
        where: { tenantId: tenantId.value, status: 'approved' },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(waterfallModelFromOrm);
  }
}
