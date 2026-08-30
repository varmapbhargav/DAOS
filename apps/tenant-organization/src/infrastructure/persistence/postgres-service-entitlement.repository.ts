import { ServiceEntitlementId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ServiceEntitlement } from '../../domain/aggregates/service-entitlement.aggregate';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';
import { ServiceEntitlementOrmEntity } from './entities/organization.orm-entities';
import { serviceEntitlementFromOrm, serviceEntitlementToOrm } from './mappers/organization-persistence.mapper';

const UPSERT_COLUMNS = [
  'plan_type',
  'billing_cycle',
  'status',
  'price_per_seat',
  'payment_method',
  'usage_limits',
  'current_usage',
  'next_invoice_date',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresServiceEntitlementRepository implements ServiceEntitlementRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(entitlement: ServiceEntitlement): Promise<void> {
    const orm = serviceEntitlementToOrm(entitlement);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${entitlement.tenantId.value}'`);
      await manager
        .getRepository(ServiceEntitlementOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ServiceEntitlementOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ServiceEntitlementId): Promise<ServiceEntitlement | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ServiceEntitlementOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? serviceEntitlementFromOrm(e) : null;
  }

  async findByTenantId(tenantId: TenantId): Promise<ServiceEntitlement | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ServiceEntitlementOrmEntity).findOne({
        where: { tenantId: tenantId.value },
      });
    });
    return e ? serviceEntitlementFromOrm(e) : null;
  }
}
