import { IssuanceId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Issuance } from '../../domain/aggregates/issuance.aggregate';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';
import { IssuanceOrmEntity } from './entities/issuance.orm-entity';
import { IssuanceMapper } from './mappers/issuance.mapper';

@Injectable()
export class PostgresIssuanceRepository implements IssuanceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(issuance: Issuance): Promise<void> {
    const orm = IssuanceMapper.toOrm(issuance);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${issuance.tenantId.value}'`);
      await manager
        .getRepository(IssuanceOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(IssuanceOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'name',
            'instrument_type',
            'network',
            'status',
            'cap_table_id',
            'whitelist',
            'transfer_restrictions',
            'token_standard',
            'total_supply_minor_units',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: IssuanceId): Promise<Issuance | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(IssuanceOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? IssuanceMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Issuance[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(IssuanceOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(IssuanceMapper.toDomain);
  }

  async findByCapTableId(tenantId: TenantId, capTableId: string): Promise<Issuance | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(IssuanceOrmEntity).findOne({ where: { tenantId: tenantId.value, capTableId } });
    });
    return e ? IssuanceMapper.toDomain(e) : null;
  }
}