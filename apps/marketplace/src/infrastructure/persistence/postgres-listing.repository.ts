import { ListingId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Listing } from '../../domain/aggregates/listing.aggregate';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { ListingOrmEntity } from './entities/marketplace.orm-entities';
import { listingFromOrm, listingToOrm } from './mappers/marketplace-persistence.mapper';

const UPSERT_COLUMNS = [
  'product_id',
  'issue_id',
  'listing_type',
  'mechanism',
  'currency',
  'status',
  'total_quantity',
  'minimum_quantity',
  'reference_price',
  'session',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresListingRepository implements ListingRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(listing: Listing): Promise<void> {
    const orm = listingToOrm(listing);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${listing.tenantId.value}'`);
      await manager
        .getRepository(ListingOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ListingOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ListingId): Promise<Listing | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ListingOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? listingFromOrm(e) : null;
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<Listing[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ListingOrmEntity).find({
        where: { tenantId: tenantId.value, productId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(listingFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<Listing[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ListingOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(listingFromOrm);
  }

  async findActive(tenantId: TenantId): Promise<Listing[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ListingOrmEntity).find({
        where: { tenantId: tenantId.value, status: 'active' },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(listingFromOrm);
  }
}
