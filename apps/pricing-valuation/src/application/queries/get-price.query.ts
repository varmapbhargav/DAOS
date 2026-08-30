import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PRICE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { PriceRepository } from '../../domain/repositories/price.repository';
import { PriceDto, toPriceDto } from '../pricing.mapper';

export class GetPriceQuery {
  constructor(public readonly isin: string) {}
}

@QueryHandler(GetPriceQuery)
export class GetPriceHandler implements IQueryHandler<GetPriceQuery, PriceDto> {
  constructor(@Inject(PRICE_REPOSITORY) private readonly prices: PriceRepository) {}

  async execute(query: GetPriceQuery): Promise<PriceDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const price = await this.prices.findByIsin(tenantId, query.isin);
    if (!price) throw new NotFoundError(`Price not found for ISIN: ${query.isin}`);
    return toPriceDto(price);
  }
}
