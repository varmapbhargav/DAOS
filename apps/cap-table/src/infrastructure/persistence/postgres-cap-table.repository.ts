import { CapTableId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CapTable } from '../../domain/aggregates/cap-table.aggregate';
import { CapTableRepository } from '../../domain/repositories/cap-table.repository';
import { CapTableOrmEntity } from './entities/cap-table.orm-entity';
import { CapTableMapper } from './mappers/cap-table.mapper';

@Injectable()
export class PostgresCapTableRepository implements CapTableRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(capTable: CapTable): Promise<void> {
    const orm = CapTableMapper.toOrm(capTable);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${capTable.tenantId.value}'`);
      await manager
        .getRepository(CapTableOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CapTableOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'issuance_id',
            'share_class_id',
            'shareholders',
            'transfer_log',
            'total_issued_units',
            'synced_at',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CapTableId): Promise<CapTable | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CapTableOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? CapTableMapper.toDomain(e) : null;
  }

  async findByIssuanceId(tenantId: TenantId, issuanceId: string): Promise<CapTable | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CapTableOrmEntity).findOne({ where: { tenantId: tenantId.value, issuanceId } });
    });
    return e ? CapTableMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<CapTable[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CapTableOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(CapTableMapper.toDomain);
  }
}