import { CorporateActionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CorporateAction } from '../../domain/aggregates/corporate-action.aggregate';
import { CorporateActionRepository } from '../../domain/repositories/corporate-action.repository';
import { CorporateActionOrmEntity } from './entities/waterfall.orm-entities';
import { corporateActionFromOrm, corporateActionToOrm } from './mappers/waterfall-persistence.mapper';

const UPSERT_COLUMNS = [
  'issuance_id',
  'type',
  'ex_date',
  'record_date',
  'payment_date',
  'status',
  'options',
  'elections',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresCorporateActionRepository implements CorporateActionRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(action: CorporateAction): Promise<void> {
    const orm = corporateActionToOrm(action);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${action.tenantId.value}'`);
      await manager
        .getRepository(CorporateActionOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CorporateActionOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CorporateActionId): Promise<CorporateAction | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CorporateActionOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? corporateActionFromOrm(e) : null;
  }

  async findByIssuanceId(tenantId: TenantId, issuanceId: string): Promise<CorporateAction[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CorporateActionOrmEntity).find({
        where: { tenantId: tenantId.value, issuanceId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(corporateActionFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<CorporateAction[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CorporateActionOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(corporateActionFromOrm);
  }

  async findByStatus(tenantId: TenantId, status: string): Promise<CorporateAction[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CorporateActionOrmEntity).find({
        where: { tenantId: tenantId.value, status },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(corporateActionFromOrm);
  }
}
