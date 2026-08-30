import { ShareClassId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ShareClass } from '../../domain/entities/share-class.aggregate';
import { ShareClassRepository } from '../../domain/repositories/share-class.repository';
import { ShareClassOrmEntity } from './entities/share-class.orm-entity';
import { ShareClassMapper } from './mappers/share-class.mapper';

@Injectable()
export class PostgresShareClassRepository implements ShareClassRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(shareClass: ShareClass): Promise<void> {
    const orm = ShareClassMapper.toOrm(shareClass);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${shareClass.tenantId.value}'`);
      await manager
        .getRepository(ShareClassOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ShareClassOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'name',
            'currency',
            'target_size_amount',
            'target_size_currency',
            'min_investment_amount',
            'min_investment_currency',
            'max_investors',
            'price_per_share_amount',
            'price_per_share_currency',
            'status',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ShareClassId): Promise<ShareClass | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(ShareClassOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? ShareClassMapper.toDomain(e) : null;
  }

  async findByProductId(tenantId: TenantId, productId: string): Promise<ShareClass[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(ShareClassOrmEntity)
        .find({ where: { tenantId: tenantId.value, productId } });
    });
    return entities.map(ShareClassMapper.toDomain);
  }
}
