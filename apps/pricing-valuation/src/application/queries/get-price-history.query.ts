import { PricingVendorPort, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PRICE_HISTORY_REPOSITORY, PRICE_REPOSITORY, PRICING_VENDOR_PORT } from '../../domain/repositories/repository.tokens';
import { PriceHistoryRepository } from '../../domain/repositories/price-history.repository';
import { PriceRepository } from '../../domain/repositories/price.repository';
import { PriceHistoryPointDto, toPriceHistoryPointDto } from '../pricing.mapper';

export class GetPriceHistoryQuery {
  constructor(
    public readonly isin: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {}
}

@QueryHandler(GetPriceHistoryQuery)
export class GetPriceHistoryHandler implements IQueryHandler<GetPriceHistoryQuery, PriceHistoryPointDto[]> {
  constructor(
    @Inject(PRICE_REPOSITORY) private readonly prices: PriceRepository,
    @Inject(PRICE_HISTORY_REPOSITORY) private readonly history: PriceHistoryRepository,
    @Inject(PRICING_VENDOR_PORT) private readonly vendor: PricingVendorPort,
  ) {}

  async execute(query: GetPriceHistoryQuery): Promise<PriceHistoryPointDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const price = await this.prices.findByIsin(tenantId, query.isin);
    const instrumentId = price ? price.id.value : query.isin;

    const rows =
      query.startDate && query.endDate
        ? await this.history.findBetween(tenantId, instrumentId, query.startDate, query.endDate)
        : await this.history.findAll(tenantId, instrumentId);

    if (rows.length === 0) {
      const vendorPoints = await this.vendor.getHistoricalPrices(
        query.isin,
        query.startDate ?? '2026-01-01',
        query.endDate ?? '2026-12-31',
      );
      return vendorPoints.map((p) =>
        toPriceHistoryPointDto({
          isin: query.isin,
          currency: p.price.currency,
          price: p.price.amount.toString(),
          timestamp: p.date,
        }),
      );
    }

    return rows.map(toPriceHistoryPointDto);
  }
}
