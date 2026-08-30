import { PriceId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Price } from '../../domain/aggregates/price.aggregate';
import { PriceRepository } from '../../domain/repositories/price.repository';
import { PriceOrmEntity } from './entities/pricing.orm-entities';
import { priceFromOrm, priceToOrm } from './mappers/pricing-persistence.mapper';

const UPSERT_COLUMNS = ['isin', 'price', 'source', 'fair_value_hierarchy', 'last_updated_at', 'is_stale', 'version', 'updated_at'];

@Injectable()
export class PostgresPriceRepository implements PriceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(price: Price): Promise<void> {
    const orm = priceToOrm(price);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${price.tenantId.value}'`);
      await manager
        .getRepository(PriceOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(PriceOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: PriceId): Promise<Price | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(PriceOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? priceFromOrm(e) : null;
  }

  async findByIsin(tenantId: TenantId, isin: string): Promise<Price | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(PriceOrmEntity).findOne({ where: { tenantId: tenantId.value, isin } });
    });
    return e ? priceFromOrm(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Price[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(PriceOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(priceFromOrm);
  }

  async findStale(tenantId: TenantId): Promise<Price[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(PriceOrmEntity).find({ where: { tenantId: tenantId.value, isStale: true } });
    });
    return entities.map(priceFromOrm);
  }
}
