import { EvidenceId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Evidence } from '../../domain/entities/evidence.entity';
import { EvidenceRepository } from '../../domain/repositories/evidence.repository';
import { EvidenceOrmEntity } from './entities/evidence.orm-entity';
import { EvidenceMapper } from './mappers/evidence.mapper';

@Injectable()
export class PostgresEvidenceRepository implements EvidenceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(evidence: Evidence): Promise<void> {
    const orm = EvidenceMapper.toOrm(evidence);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${evidence.tenantId.value}'`);
      await manager
        .getRepository(EvidenceOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(EvidenceOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'asset_id',
            'case_id',
            'evidence_type',
            'source',
            'source_reference',
            'evidence_date',
            'collected_at',
            'collected_by',
            'confidence',
            'verification_status',
            'document_id',
            'external_reference',
            'hash',
            'signature',
            'expiry',
            'access_policy',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: EvidenceId): Promise<Evidence | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(EvidenceOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? EvidenceMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<Evidence[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(EvidenceOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(EvidenceMapper.toDomain);
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<Evidence[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(EvidenceOrmEntity).find({ where: { tenantId: tenantId.value, caseId } });
    });
    return entities.map(EvidenceMapper.toDomain);
  }
}
