import { TenantId, TenantProfileId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TenantProfile } from '../../domain/aggregates/tenant-profile.aggregate';
import { TenantProfileRepository } from '../../domain/repositories/tenant-profile.repository';
import { TenantProfileOrmEntity } from './entities/organization.orm-entities';
import { tenantProfileFromOrm, tenantProfileToOrm } from './mappers/organization-persistence.mapper';

const UPSERT_COLUMNS = [
  'org_name',
  'legal_name',
  'tax_id',
  'website',
  'contact_email',
  'contact_phone',
  'country',
  'addresses',
  'brand_color',
  'logo_url',
  'custom_domain',
  'feature_flags',
  'status',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresTenantProfileRepository implements TenantProfileRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(profile: TenantProfile): Promise<void> {
    const orm = tenantProfileToOrm(profile);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${profile.tenantId.value}'`);
      await manager
        .getRepository(TenantProfileOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(TenantProfileOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: TenantProfileId): Promise<TenantProfile | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(TenantProfileOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? tenantProfileFromOrm(e) : null;
  }

  async findByTenantId(tenantId: TenantId): Promise<TenantProfile | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(TenantProfileOrmEntity).findOne({
        where: { tenantId: tenantId.value },
      });
    });
    return e ? tenantProfileFromOrm(e) : null;
  }
}
