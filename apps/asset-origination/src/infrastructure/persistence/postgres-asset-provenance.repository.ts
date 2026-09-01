import { ProvenanceEventId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetProvenance } from '../../domain/entities/asset-provenance.entity';
import { AssetProvenanceRepository } from '../../domain/repositories/asset-provenance.repository';
import { AssetProvenanceOrmEntity } from './entities/asset-provenance.orm-entity';
import { AssetProvenanceMapper } from './mappers/asset-provenance.mapper';

@Injectable()
export class PostgresAssetProvenanceRepository implements AssetProvenanceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(provenance: AssetProvenance): Promise<void> {
    const orm = AssetProvenanceMapper.toOrm(provenance);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${provenance.tenantId.value}'`);
      await manager
        .getRepository(AssetProvenanceOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetProvenanceOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'event_type',
            'from_entity_id',
            'to_entity_id',
            'effective_date',
            'recorded_date',
            'jurisdiction',
            'registry_reference',
            'document_reference',
            'transaction_reference',
            'verification_status',
            'evidence_references',
            'hash',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ProvenanceEventId): Promise<AssetProvenance | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetProvenanceOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? AssetProvenanceMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetProvenance[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetProvenanceOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(AssetProvenanceMapper.toDomain);
  }
}
