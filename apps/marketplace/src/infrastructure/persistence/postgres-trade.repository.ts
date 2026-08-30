import { TenantId, TradeId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Trade } from '../../domain/aggregates/trade.aggregate';
import { TradeRepository } from '../../domain/repositories/trade.repository';
import { TradeOrmEntity } from './entities/marketplace.orm-entities';
import { tradeFromOrm, tradeToOrm } from './mappers/marketplace-persistence.mapper';

const UPSERT_COLUMNS = [
  'listing_id',
  'buy_order_id',
  'sell_order_id',
  'quantity',
  'price',
  'status',
  'executed_at',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresTradeRepository implements TradeRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(trade: Trade): Promise<void> {
    const orm = tradeToOrm(trade);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${trade.tenantId.value}'`);
      await manager
        .getRepository(TradeOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(TradeOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: TradeId): Promise<Trade | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(TradeOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? tradeFromOrm(e) : null;
  }

  async findByListingId(tenantId: TenantId, listingId: string): Promise<Trade[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(TradeOrmEntity).find({
        where: { tenantId: tenantId.value, listingId },
        order: { executedAt: 'ASC' },
      });
    });
    return entities.map(tradeFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<Trade[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(TradeOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { executedAt: 'ASC' },
      });
    });
    return entities.map(tradeFromOrm);
  }
}
