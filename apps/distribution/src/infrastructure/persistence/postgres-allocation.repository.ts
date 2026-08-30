import { AllocationId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Allocation } from '../../domain/aggregates/allocation.aggregate';
import { AllocationRepository } from '../../domain/repositories/allocation.repository';
import { AllocationOrmEntity } from './entities/distribution.orm-entities';
import { allocationFromOrm, allocationToOrm } from './mappers/distribution.mapper';

const UPSERT_COLUMNS = [
  'closing_id',
  'product_id',
  'method',
  'status',
  'total_amount',
  'entries',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresAllocationRepository implements AllocationRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(allocation: Allocation): Promise<void> {
    const orm = allocationToOrm(allocation);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${allocation.tenantId.value}'`);
      await manager
        .getRepository(AllocationOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AllocationOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: AllocationId): Promise<Allocation | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AllocationOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? allocationFromOrm(e) : null;
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<Allocation[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AllocationOrmEntity).find({
        where: { tenantId: tenantId.value, productId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(allocationFromOrm);
  }

  async findByClosingId(tenantId: TenantId, closingId: string): Promise<Allocation[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AllocationOrmEntity).find({
        where: { tenantId: tenantId.value, closingId },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(allocationFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<Allocation[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AllocationOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(allocationFromOrm);
  }
}
