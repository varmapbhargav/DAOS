import { randomUUID } from 'node:crypto';

import { TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual } from 'typeorm';

import { PriceHistoryRepository, PriceHistoryRow } from '../../domain/repositories/price-history.repository';
import { PriceHistoryOrmEntity } from './entities/pricing.orm-entities';

@Injectable()
export class PostgresPriceHistoryRepository implements PriceHistoryRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async append(row: PriceHistoryRow): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${row.tenantId}'`);
      await manager.getRepository(PriceHistoryOrmEntity).insert({
        id: randomUUID(),
        tenantId: row.tenantId,
        instrumentId: row.instrumentId,
        isin: row.isin,
        currency: row.currency,
        price: row.price,
        asOf: row.timestamp,
      });
    });
  }

  async findBetween(tenantId: TenantId, instrumentId: string, startDate: string, endDate: string): Promise<PriceHistoryRow[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(PriceHistoryOrmEntity).find({
        where: { tenantId: tenantId.value, instrumentId, asOf: MoreThanOrEqual(startDate) },
      });
    });
    return entities
      .filter((e) => e.asOf <= endDate)
      .sort((a, b) => (a.asOf < b.asOf ? -1 : 1))
      .map((e) => ({
        tenantId: e.tenantId,
        instrumentId: e.instrumentId,
        isin: e.isin,
        currency: e.currency,
        price: e.price,
        timestamp: e.asOf,
      }));
  }

  async findAll(tenantId: TenantId, instrumentId: string): Promise<PriceHistoryRow[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(PriceHistoryOrmEntity).find({
        where: { tenantId: tenantId.value, instrumentId },
      });
    });
    return entities
      .sort((a, b) => (a.asOf < b.asOf ? -1 : 1))
      .map((e) => ({
        tenantId: e.tenantId,
        instrumentId: e.instrumentId,
        isin: e.isin,
        currency: e.currency,
        price: e.price,
        timestamp: e.asOf,
      }));
  }
}
