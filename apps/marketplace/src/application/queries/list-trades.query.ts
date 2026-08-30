import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TRADE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TradeRepository } from '../../domain/repositories/trade.repository';
import { toTradeDto, TradeDto } from '../marketplace.mapper';

export class ListTradesQuery {
  constructor(public readonly listingId?: string) {}
}

@QueryHandler(ListTradesQuery)
export class ListTradesHandler implements IQueryHandler<ListTradesQuery, TradeDto[]> {
  constructor(@Inject(TRADE_REPOSITORY) private readonly trades: TradeRepository) {}

  async execute(query: ListTradesQuery): Promise<TradeDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    if (query.listingId) {
      return (await this.trades.findByListingId(tenantId, query.listingId)).map(toTradeDto);
    }
    return (await this.trades.findAll(tenantId)).map(toTradeDto);
  }
}
