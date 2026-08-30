import { SubscriptionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Subscription } from '../../domain/aggregates/subscription.aggregate';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { SubscriptionOrmEntity } from './entities/distribution.orm-entities';
import { subscriptionFromOrm, subscriptionToOrm } from './mappers/distribution.mapper';

const UPSERT_COLUMNS = [
  'product_id',
  'investor_id',
  'status',
  'requested_amount',
  'allocated_amount',
  'allocation_pct',
  'payment_ref',
  'reject_reason',
  'funded_at',
  'received_at',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresSubscriptionRepository implements SubscriptionRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(subscription: Subscription): Promise<void> {
    const orm = subscriptionToOrm(subscription);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${subscription.tenantId.value}'`);
      await manager
        .getRepository(SubscriptionOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(SubscriptionOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: SubscriptionId): Promise<Subscription | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SubscriptionOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? subscriptionFromOrm(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Subscription[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SubscriptionOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { receivedAt: 'ASC' },
      });
    });
    return entities.map(subscriptionFromOrm);
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<Subscription[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SubscriptionOrmEntity).find({
        where: { tenantId: tenantId.value, productId },
        order: { receivedAt: 'ASC' },
      });
    });
    return entities.map(subscriptionFromOrm);
  }

  async findByInvestorId(tenantId: TenantId, investorId: string): Promise<Subscription[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SubscriptionOrmEntity).find({
        where: { tenantId: tenantId.value, investorId },
        order: { receivedAt: 'ASC' },
      });
    });
    return entities.map(subscriptionFromOrm);
  }
}
