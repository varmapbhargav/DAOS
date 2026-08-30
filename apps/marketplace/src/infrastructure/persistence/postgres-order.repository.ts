import { OrderId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { Order } from '../../domain/aggregates/order.aggregate';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderOrmEntity } from './entities/marketplace.orm-entities';
import { orderFromOrm, orderToOrm } from './mappers/marketplace-persistence.mapper';

const OPEN_STATUSES = ['new', 'partiallyFilled'];

const UPSERT_COLUMNS = [
  'listing_id',
  'investor_id',
  'side',
  'order_type',
  'status',
  'quantity',
  'filled_quantity',
  'limit_price',
  'placed_at',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresOrderRepository implements OrderRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(order: Order): Promise<void> {
    const orm = orderToOrm(order);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${order.tenantId.value}'`);
      await manager
        .getRepository(OrderOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(OrderOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: OrderId): Promise<Order | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OrderOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? orderFromOrm(e) : null;
  }

  async findByListingId(tenantId: TenantId, listingId: string): Promise<Order[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OrderOrmEntity).find({
        where: { tenantId: tenantId.value, listingId },
        order: { placedAt: 'ASC' },
      });
    });
    return entities.map(orderFromOrm);
  }

  async findByInvestorId(tenantId: TenantId, investorId: string): Promise<Order[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OrderOrmEntity).find({
        where: { tenantId: tenantId.value, investorId },
        order: { placedAt: 'ASC' },
      });
    });
    return entities.map(orderFromOrm);
  }

  async findOpenByListingId(tenantId: TenantId, listingId: string): Promise<Order[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OrderOrmEntity).find({
        where: { tenantId: tenantId.value, listingId, status: In(OPEN_STATUSES) },
        order: { placedAt: 'ASC' },
      });
    });
    return entities.map(orderFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<Order[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OrderOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { placedAt: 'ASC' },
      });
    });
    return entities.map(orderFromOrm);
  }
}
