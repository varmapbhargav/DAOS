import { RightsId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetRights } from '../../domain/entities/asset-rights.entity';
import { AssetRightsRepository } from '../../domain/repositories/asset-rights.repository';
import { AssetRightsOrmEntity } from './entities/asset-rights.orm-entity';
import { AssetRightsMapper } from './mappers/asset-rights.mapper';

@Injectable()
export class PostgresAssetRightsRepository implements AssetRightsRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(rights: AssetRights): Promise<void> {
    const orm = AssetRightsMapper.toOrm(rights);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${rights.tenantId.value}'`);
      await manager
        .getRepository(AssetRightsOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetRightsOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'right_type',
            'holder_entity_id',
            'holder_person_id',
            'percentage',
            'priority',
            'effective_from',
            'effective_to',
            'transferable',
            'assignable',
            'evidence_references',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: RightsId): Promise<AssetRights | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetRightsOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? AssetRightsMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetRights[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetRightsOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(AssetRightsMapper.toDomain);
  }

  async delete(tenantId: TenantId, id: RightsId): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      await manager.getRepository(AssetRightsOrmEntity).delete({ tenantId: tenantId.value, id: id.value });
    });
  }
}
