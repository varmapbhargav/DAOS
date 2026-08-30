import { FairValueHierarchy, Money, PriceId, PricingSource, TenantId } from '@daos/shared-kernel';

import { Price } from '../../src/domain/aggregates/price.aggregate';

describe('Price aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function publish(overrides: Partial<Parameters<typeof Price.publish>[0]> = {}) {
    return Price.publish({
      tenantId,
      isin: 'US0378331005',
      price: Money.of(1_000_000n, 'USD'),
      source: 'marketFeed' as PricingSource,
      fairValueHierarchy: 'level1' as FairValueHierarchy,
      marketDate: '2026-08-30',
      ...overrides,
    });
  }

  it('publishes a price and raises PriceUpdated', () => {
    const price = publish();
    expect(price.id).toBeInstanceOf(PriceId);
    expect(price.isin).toBe('US0378331005');
    expect(price.price.amount).toBe(1_000_000n);
    expect(price.isStale).toBe(false);
    expect(price.pullEvents().map((e) => e.eventType)).toContain('price.updated.v1');
  });

  it('rejects invalid publish parameters', () => {
    expect(() => publish({ isin: '  ' })).toThrow('ISIN is required');
  });

  it('updates a price and raises PriceUpdated again', () => {
    const price = publish();
    price.pullEvents();
    price.updatePrice({
      price: Money.of(1_050_000n, 'USD'),
      source: 'vendorApi' as PricingSource,
      fairValueHierarchy: 'level2' as FairValueHierarchy,
      marketDate: '2026-08-31',
    });

    expect(price.price.amount).toBe(1_050_000n);
    expect(price.source).toBe('vendorApi');
    expect(price.pullEvents().map((e) => e.eventType)).toContain('price.updated.v1');
  });

  it('marks a price stale and raises StalePriceDetected', () => {
    const price = publish();
    price.pullEvents();
    price.markStale();

    expect(price.isStale).toBe(true);
    expect(price.pullEvents().map((e) => e.eventType)).toContain('price.stale-detected.v1');
  });

  it('refuses to mark an already-stale price', () => {
    const price = publish();
    price.pullEvents();
    price.markStale();
    price.pullEvents();
    expect(() => price.markStale()).toThrow('Price is already marked stale');
  });

  it('clears staleness when updated', () => {
    const price = publish();
    price.pullEvents();
    price.markStale();
    price.pullEvents();
    price.updatePrice({
      price: Money.of(1_100_000n, 'USD'),
      source: 'manual' as PricingSource,
      fairValueHierarchy: 'level3' as FairValueHierarchy,
      marketDate: '2026-09-01',
    });
    expect(price.isStale).toBe(false);
  });
});
