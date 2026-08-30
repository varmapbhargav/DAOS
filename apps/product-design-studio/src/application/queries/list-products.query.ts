import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { INVESTMENT_PRODUCT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { ProductDto, toProductDto } from '../product.mapper';

export class ListProductsQuery {
  constructor(public readonly productType?: string) {}
}

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<ListProductsQuery, ProductDto[]> {
  constructor(@Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository) {}

  async execute(query: ListProductsQuery): Promise<ProductDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.products.findAll(tenantId);
    const filtered = query.productType ? list.filter((p) => p.productType === query.productType) : list;
    return filtered.map(toProductDto);
  }
}
