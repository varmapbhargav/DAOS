import { CapitalCallId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CapitalCall } from '../../domain/aggregates/capital-call.aggregate';
import { CapitalCallRepository } from '../../domain/repositories/capital-call.repository';
import { CapitalCallOrmEntity } from './entities/distribution.orm-entities';
import { capitalCallFromOrm, capitalCallToOrm } from './mappers/distribution.mapper';

const UPSERT_COLUMNS = [
  'closing_id',
  'investor_id',
  'amount',
  'amount_funded',
  'status',
  'due_date',
  'funded_at',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresCapitalCallRepository implements CapitalCallRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(call: CapitalCall): Promise<void> {
    const orm = capitalCallToOrm(call);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${call.tenantId.value}'`);
      await manager
        .getRepository(CapitalCallOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CapitalCallOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CapitalCallId): Promise<CapitalCall | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CapitalCallOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? capitalCallFromOrm(e) : null;
  }

  async findByClosingId(tenantId: TenantId, closingId: string): Promise<CapitalCall[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CapitalCallOrmEntity).find({
        where: { tenantId: tenantId.value, closingId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(capitalCallFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<CapitalCall[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CapitalCallOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(capitalCallFromOrm);
  }
}
