import { ApiKeyId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ApiKey } from '../../domain/aggregates/api-key.aggregate';
import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { ApiKeyOrmEntity } from './entities/organization.orm-entities';
import { apiKeyFromOrm, apiKeyToOrm } from './mappers/organization-persistence.mapper';

const UPSERT_COLUMNS = [
  'label',
  'key_hash',
  'scope',
  'status',
  'prefix',
  'created_at',
  'expires_at',
  'last_used_at',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresApiKeyRepository implements ApiKeyRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(apiKey: ApiKey): Promise<void> {
    const orm = apiKeyToOrm(apiKey);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${apiKey.tenantId.value}'`);
      await manager
        .getRepository(ApiKeyOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ApiKeyOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ApiKeyId): Promise<ApiKey | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ApiKeyOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? apiKeyFromOrm(e) : null;
  }

  async findByLabel(tenantId: TenantId, label: string): Promise<ApiKey | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ApiKeyOrmEntity).findOne({
        where: { tenantId: tenantId.value, label },
      });
    });
    return e ? apiKeyFromOrm(e) : null;
  }

  async findByHash(tenantId: TenantId, keyHash: string): Promise<ApiKey | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ApiKeyOrmEntity).findOne({
        where: { tenantId: tenantId.value, keyHash },
      });
    });
    return e ? apiKeyFromOrm(e) : null;
  }

  async listByTenant(tenantId: TenantId): Promise<ApiKey[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ApiKeyOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { dbCreatedAt: 'ASC' },
      });
    });
    return entities.map(apiKeyFromOrm);
  }
}
