import { EncumbranceId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetEncumbrance } from '../../domain/entities/asset-encumbrance.entity';
import { AssetEncumbranceRepository } from '../../domain/repositories/asset-encumbrance.repository';
import { AssetEncumbranceOrmEntity } from './entities/asset-encumbrance.orm-entity';
import { AssetEncumbranceMapper } from './mappers/asset-encumbrance.mapper';

@Injectable()
export class PostgresAssetEncumbranceRepository implements AssetEncumbranceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(encumbrance: AssetEncumbrance): Promise<void> {
    const orm = AssetEncumbranceMapper.toOrm(encumbrance);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${encumbrance.tenantId.value}'`);
      await manager
        .getRepository(AssetEncumbranceOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetEncumbranceOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'type',
            'holder_entity_id',
            'amount_minor_units',
            'currency',
            'priority',
            'registration_number',
            'effective_from',
            'effective_to',
            'status',
            'release_conditions',
            'evidence_references',
            'verification_status',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: EncumbranceId): Promise<AssetEncumbrance | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetEncumbranceOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? AssetEncumbranceMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetEncumbrance[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetEncumbranceOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(AssetEncumbranceMapper.toDomain);
  }

  async delete(tenantId: TenantId, id: EncumbranceId): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      await manager.getRepository(AssetEncumbranceOrmEntity).delete({ tenantId: tenantId.value, id: id.value });
    });
  }
}
