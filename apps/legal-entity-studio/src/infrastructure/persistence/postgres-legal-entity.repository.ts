import { LegalEntityId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { LegalEntity } from '../../domain/aggregates/legal-entity.aggregate';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { LegalEntityOrmEntity } from './entities/legal-entity.orm-entity';
import { LegalEntityMapper } from './mappers/legal-entity.mapper';

@Injectable()
export class PostgresLegalEntityRepository implements LegalEntityRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(entity: LegalEntity): Promise<void> {
    const orm = LegalEntityMapper.toOrm(entity);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${entity.tenantId.value}'`);
      await manager
        .getRepository(LegalEntityOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(LegalEntityOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'legal_name',
            'entity_type',
            'jurisdiction',
            'status',
            'registered_agent',
            'beneficial_owners',
            'hierarchy',
            'document_ids',
            'formation_ref',
            'dissolution_reason',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: LegalEntityId): Promise<LegalEntity | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(LegalEntityOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? LegalEntityMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<LegalEntity[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(LegalEntityOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(LegalEntityMapper.toDomain);
  }
}
