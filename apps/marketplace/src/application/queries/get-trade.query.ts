import { NotFoundError, TenantContextHolder, TenantId, TradeId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TRADE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TradeRepository } from '../../domain/repositories/trade.repository';
import { toTradeDto, TradeDto } from '../marketplace.mapper';

export class GetTradeQuery {
  constructor(public readonly tradeId: string) {}
}

@QueryHandler(GetTradeQuery)
export class GetTradeHandler implements IQueryHandler<GetTradeQuery, TradeDto> {
  constructor(@Inject(TRADE_REPOSITORY) private readonly trades: TradeRepository) {}

  async execute(query: GetTradeQuery): Promise<TradeDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const trade = await this.trades.findById(tenantId, TradeId.create(query.tradeId));
    if (!trade) throw new NotFoundError(`Trade not found: ${query.tradeId}`);
    return toTradeDto(trade);
  }
}
