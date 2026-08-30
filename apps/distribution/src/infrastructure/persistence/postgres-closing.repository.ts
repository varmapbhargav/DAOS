import { ClosingId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Closing } from '../../domain/aggregates/closing.aggregate';
import { ClosingRepository } from '../../domain/repositories/closing.repository';
import { ClosingOrmEntity } from './entities/distribution.orm-entities';
import { closingFromOrm, closingToOrm } from './mappers/distribution.mapper';

const UPSERT_COLUMNS = [
  'product_id',
  'status',
  'closes_at',
  'completed_at',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresClosingRepository implements ClosingRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(closing: Closing): Promise<void> {
    const orm = closingToOrm(closing);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${closing.tenantId.value}'`);
      await manager
        .getRepository(ClosingOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ClosingOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ClosingId): Promise<Closing | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ClosingOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? closingFromOrm(e) : null;
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<Closing[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ClosingOrmEntity).find({
        where: { tenantId: tenantId.value, productId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(closingFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<Closing[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ClosingOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(closingFromOrm);
  }
}
