import { OwnershipId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Ownership } from '../../domain/entities/ownership.entity';
import { OwnershipRepository } from '../../domain/repositories/ownership.repository';
import { OwnershipOrmEntity } from './entities/ownership.orm-entity';
import { OwnershipMapper } from './mappers/ownership.mapper';

@Injectable()
export class PostgresOwnershipRepository implements OwnershipRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(ownership: Ownership): Promise<void> {
    const orm = OwnershipMapper.toOrm(ownership);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${ownership.tenantId.value}'`);
      await manager
        .getRepository(OwnershipOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(OwnershipOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'entity_id',
            'person_id',
            'ownership_type',
            'ownership_percentage',
            'economic_interest_percentage',
            'control_percentage',
            'acquisition_date',
            'effective_from',
            'effective_to',
            'evidence_references',
            'verification_status',
            'verified_by',
            'verified_at',
            'notes',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: OwnershipId): Promise<Ownership | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OwnershipOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? OwnershipMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<Ownership[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OwnershipOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(OwnershipMapper.toDomain);
  }

  async delete(tenantId: TenantId, id: OwnershipId): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      await manager.getRepository(OwnershipOrmEntity).delete({ tenantId: tenantId.value, id: id.value });
    });
  }
}
