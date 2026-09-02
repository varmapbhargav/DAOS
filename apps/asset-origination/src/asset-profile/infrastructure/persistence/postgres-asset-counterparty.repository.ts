import { CounterpartyId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetCounterparty } from '../../domain/entities/asset-counterparty.entity';
import { AssetCounterpartyRepository } from '../../domain/repositories/asset-counterparty.repository';
import { AssetCounterpartyOrmEntity } from './entities/asset-counterparty.orm-entity';
import { AssetCounterpartyMapper } from './mappers/asset-counterparty.mapper';

@Injectable()
export class PostgresAssetCounterpartyRepository implements AssetCounterpartyRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(counterparty: AssetCounterparty): Promise<void> {
    const orm = AssetCounterpartyMapper.toOrm(counterparty);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${counterparty.tenantId.value}'`);
      await manager
        .getRepository(AssetCounterpartyOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetCounterpartyOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'entity_id',
            'person_id',
            'counterparty_type',
            'role',
            'legal_role',
            'economic_role',
            'ownership_percentage',
            'effective_from',
            'effective_to',
            'verification_status',
            'compliance_status',
            'evidence_references',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CounterpartyId): Promise<AssetCounterparty | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetCounterpartyOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? AssetCounterpartyMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetCounterparty[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetCounterpartyOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(AssetCounterpartyMapper.toDomain);
  }

  async delete(tenantId: TenantId, id: CounterpartyId): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      await manager.getRepository(AssetCounterpartyOrmEntity).delete({ tenantId: tenantId.value, id: id.value });
    });
  }
}
