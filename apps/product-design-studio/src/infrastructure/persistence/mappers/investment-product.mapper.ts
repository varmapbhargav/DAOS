import { Benchmark, FeeStructure, InvestmentProductId, LiquidityTerms, ProductStatus, ProductStrategy, ProductType, TenantId } from '@daos/shared-kernel';

import { InvestmentProduct } from '../../../domain/aggregates/investment-product.aggregate';
import { InvestmentProductOrmEntity } from '../entities/investment-product.orm-entity';

export class InvestmentProductMapper {
  static toDomain(e: InvestmentProductOrmEntity): InvestmentProduct {
    return InvestmentProduct.reconstruct({
      id: InvestmentProductId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      name: e.name,
      productType: e.productType as ProductType,
      strategy: e.strategy as unknown as ProductStrategy,
      benchmark: e.benchmark as unknown as Benchmark | null,
      liquidityTerms: e.liquidityTerms as unknown as LiquidityTerms,
      feeStructure: e.feeStructure as unknown as FeeStructure,
      status: e.status as ProductStatus,
      shareClassIds: e.shareClassIds,
      approvedBy: e.approvedBy,
      rejectionReason: e.rejectionReason,
      version: e.version,
    });
  }

  static toOrm(domain: InvestmentProduct): InvestmentProductOrmEntity {
    const e = new InvestmentProductOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.name = domain.name;
    e.productType = domain.productType;
    e.strategy = domain.strategy;
    e.benchmark = domain.benchmark;
    e.liquidityTerms = domain.liquidityTerms;
    e.feeStructure = domain.feeStructure;
    e.status = domain.status;
    e.shareClassIds = domain.shareClassIds;
    e.approvedBy = domain.approvedBy;
    e.rejectionReason = domain.rejectionReason;
    e.version = domain.version;
    return e;
  }
}
