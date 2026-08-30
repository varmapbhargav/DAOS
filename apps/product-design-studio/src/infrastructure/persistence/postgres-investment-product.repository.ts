import { InvestmentProductId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { InvestmentProduct } from '../../domain/aggregates/investment-product.aggregate';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { InvestmentProductOrmEntity } from './entities/investment-product.orm-entity';
import { InvestmentProductMapper } from './mappers/investment-product.mapper';

@Injectable()
export class PostgresInvestmentProductRepository implements InvestmentProductRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(product: InvestmentProduct): Promise<void> {
    const orm = InvestmentProductMapper.toOrm(product);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${product.tenantId.value}'`);
      await manager
        .getRepository(InvestmentProductOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(InvestmentProductOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'name',
            'product_type',
            'strategy',
            'benchmark',
            'liquidity_terms',
            'fee_structure',
            'status',
            'share_class_ids',
            'approved_by',
            'rejection_reason',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: InvestmentProductId): Promise<InvestmentProduct | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(InvestmentProductOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? InvestmentProductMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<InvestmentProduct[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(InvestmentProductOrmEntity)
        .find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(InvestmentProductMapper.toDomain);
  }
}
