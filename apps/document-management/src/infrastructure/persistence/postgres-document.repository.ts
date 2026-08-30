import { DocumentId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Document } from '../../domain/aggregates/document.aggregate';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentOrmEntity } from './entities/document.orm-entity';
import { DocumentMapper } from './mappers/document.mapper';

@Injectable()
export class PostgresDocumentRepository implements DocumentRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(document: Document): Promise<void> {
    const orm = DocumentMapper.toOrm(document);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${document.tenantId.value}'`);
      await manager
        .getRepository(DocumentOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DocumentOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'file_name',
            'category',
            'entity_ref',
            'status',
            'current_version_number',
            'versions',
            'uploaded_by',
            'uploaded_at',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DocumentId): Promise<Document | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DocumentOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? DocumentMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Document[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DocumentOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(DocumentMapper.toDomain);
  }
}