import { CorporateDocumentId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CorporateDocument } from '../../domain/entities/corporate-document.aggregate';
import { CorporateDocumentRepository } from '../../domain/repositories/corporate-document.repository';
import { CorporateDocumentOrmEntity } from './entities/corporate-document.orm-entity';
import { CorporateDocumentMapper } from './mappers/corporate-document.mapper';

@Injectable()
export class PostgresCorporateDocumentRepository implements CorporateDocumentRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(document: CorporateDocument): Promise<void> {
    const orm = CorporateDocumentMapper.toOrm(document);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${document.tenantId.value}'`);
      await manager
        .getRepository(CorporateDocumentOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CorporateDocumentOrmEntity)
        .values(orm)
        .orUpdate(['doc_type', 'file_ref', 'status', 'signatories', 'version', 'updated_at'], ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CorporateDocumentId): Promise<CorporateDocument | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CorporateDocumentOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? CorporateDocumentMapper.toDomain(e) : null;
  }

  async findByEntityId(tenantId: TenantId, entityId: string): Promise<CorporateDocument[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(CorporateDocumentOrmEntity)
        .find({ where: { tenantId: tenantId.value, entityId } });
    });
    return entities.map(CorporateDocumentMapper.toDomain);
  }
}
