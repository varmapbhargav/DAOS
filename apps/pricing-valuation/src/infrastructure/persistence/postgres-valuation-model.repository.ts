import { TenantId, ValuationModelId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ValuationModel } from '../../domain/aggregates/valuation-model.aggregate';
import { ValuationModelRepository } from '../../domain/repositories/valuation-model.repository';
import { ValuationModelOrmEntity } from './entities/pricing.orm-entities';
import { valuationModelFromOrm, valuationModelToOrm } from './mappers/pricing-persistence.mapper';

const UPSERT_COLUMNS = [
  'asset_id',
  'methodology',
  'status',
  'value',
  'report_id',
  'rejection_reason',
  'discrepancy_detected',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresValuationModelRepository implements ValuationModelRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(model: ValuationModel): Promise<void> {
    const orm = valuationModelToOrm(model);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${model.tenantId.value}'`);
      await manager
        .getRepository(ValuationModelOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ValuationModelOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ValuationModelId): Promise<ValuationModel | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ValuationModelOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? valuationModelFromOrm(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<ValuationModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ValuationModelOrmEntity).find({
        where: { tenantId: tenantId.value, assetId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(valuationModelFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<ValuationModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ValuationModelOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(valuationModelFromOrm);
  }
}
