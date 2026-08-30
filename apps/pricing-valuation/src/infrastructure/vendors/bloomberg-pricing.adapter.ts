import { Money, PricingVendorPort } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BloombergPricingAdapter implements PricingVendorPort {
  private readonly basePrices: Record<string, bigint> = {
    'US0378331005': 1_000_000n,
    'US5949181045': 2_500_000n,
  };

  async getRealtimePrice(isin: string): Promise<{ price: Money; source: string }> {
    const base = this.basePrices[isin] ?? 1_000_000n;
    return { price: Money.of(base, 'USD'), source: 'BLOOMBERG' };
  }

  async getHistoricalPrices(
    isin: string,
    startDate: string,
    endDate: string,
  ): Promise<{ date: string; price: Money }[]> {
    const base = this.basePrices[isin] ?? 1_000_000n;
    const points: { date: string; price: Money }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cursor = new Date(start);
    let i = 0;
    while (cursor <= end && i < 30) {
      points.push({
        date: cursor.toISOString().slice(0, 10),
        price: Money.of(base + BigInt(i) * 1_000n, 'USD'),
      });
      cursor.setDate(cursor.getDate() + 1);
      i++;
    }
    return points;
  }
}
