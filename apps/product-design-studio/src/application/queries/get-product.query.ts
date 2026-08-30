import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InvestmentProductId } from '@daos/shared-kernel';

import { INVESTMENT_PRODUCT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { ProductDto, toProductDto } from '../product.mapper';

export class GetProductQuery {
  constructor(public readonly productId: string) {}
}

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery, ProductDto> {
  constructor(@Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository) {}

  async execute(query: GetProductQuery): Promise<ProductDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const product = await this.products.findById(tenantId, InvestmentProductId.create(query.productId));
    if (!product) throw new NotFoundError(`Product not found: ${query.productId}`);
    return toProductDto(product);
  }
}
