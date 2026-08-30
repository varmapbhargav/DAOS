import { CashFlowModelId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CashFlowModel } from '../../domain/aggregates/cash-flow-model.aggregate';
import { CashFlowModelRepository } from '../../domain/repositories/cash-flow-model.repository';
import { CashFlowModelOrmEntity } from './entities/cash-flow-model.orm-entity';
import { CashFlowModelMapper } from './mappers/cash-flow-model.mapper';

@Injectable()
export class PostgresCashFlowModelRepository implements CashFlowModelRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(model: CashFlowModel): Promise<void> {
    const orm = CashFlowModelMapper.toOrm(model);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${model.tenantId.value}'`);
      await manager
        .getRepository(CashFlowModelOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CashFlowModelOrmEntity)
        .values(orm)
        .orUpdate(
          ['name', 'term_periods', 'cash_flows', 'discount_rate_percent', 'version', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(id: CashFlowModelId, tenantId: TenantId): Promise<CashFlowModel | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(CashFlowModelOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? CashFlowModelMapper.toDomain(e) : null;
  }

  async findByAssetId(assetId: string, tenantId: TenantId): Promise<CashFlowModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(CashFlowModelOrmEntity)
        .find({ where: { tenantId: tenantId.value, assetId }, order: { createdAt: 'DESC' } });
    });
    return entities.map(CashFlowModelMapper.toDomain);
  }

  async delete(id: CashFlowModelId, tenantId: TenantId): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      await manager.getRepository(CashFlowModelOrmEntity).delete({ id: id.value, tenantId: tenantId.value });
    });
  }
}
