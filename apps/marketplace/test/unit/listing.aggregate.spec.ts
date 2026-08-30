import { ListingId, ListingType, Money, TenantId, TradingMechanism } from '@daos/shared-kernel';

import { Listing } from '../../src/domain/aggregates/listing.aggregate';

describe('Listing aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function publishListing() {
    return Listing.publish({
      tenantId,
      productId: 'product-1',
      issueId: 'issue-1',
      listingType: 'secondary' as ListingType,
      mechanism: 'orderBook' as TradingMechanism,
      currency: 'USD',
      totalQuantity: 1000n,
      minimumQuantity: 10n,
      referencePrice: Money.of(100n, 'USD'),
      session: { openAt: '09:00', closeAt: '17:00', timezone: 'UTC' },
    });
  }

  it('publishes an active listing and raises ListingPublished', () => {
    const listing = publishListing();

    expect(listing.id).toBeInstanceOf(ListingId);
    expect(listing.status).toBe('active');
    expect(listing.totalQuantity).toBe(1000n);
    const events = listing.pullEvents();
    expect(events.some((e) => e.eventType === 'listing.published.v1')).toBe(true);
  });

  it('rejects invalid publish parameters', () => {
    expect(() =>
      Listing.publish({
        tenantId,
        productId: ' ',
        listingType: 'secondary' as ListingType,
        mechanism: 'orderBook' as TradingMechanism,
        currency: 'USD',
        totalQuantity: 0n,
        minimumQuantity: 10n,
        referencePrice: null,
        session: { openAt: '09:00', closeAt: '17:00', timezone: 'UTC' },
      }),
    ).toThrow('Product id is required');

    expect(() =>
      Listing.publish({
        tenantId,
        productId: 'product-1',
        listingType: 'secondary' as ListingType,
        mechanism: 'orderBook' as TradingMechanism,
        currency: 'USD',
        totalQuantity: 1000n,
        minimumQuantity: 2000n,
        referencePrice: null,
        session: { openAt: '09:00', closeAt: '17:00', timezone: 'UTC' },
      }),
    ).toThrow('Minimum quantity cannot exceed total quantity');
  });

  it('suspends an active listing and raises ListingSuspended', () => {
    const listing = publishListing();
    listing.pullEvents();
    listing.suspend('compliance review');

    expect(listing.status).toBe('suspended');
    expect(listing.pullEvents().map((e) => e.eventType)).toContain('listing.suspended.v1');
  });

  it('refuses to suspend a non-active listing', () => {
    const listing = publishListing();
    listing.pullEvents();
    listing.suspend('reason');
    listing.pullEvents();
    expect(() => listing.suspend('again')).toThrow('Only active listings can be suspended');
  });

  it('delists a listing and raises ListingDelisted', () => {
    const listing = publishListing();
    listing.pullEvents();
    listing.delist('end of raise');

    expect(listing.status).toBe('delisted');
    expect(listing.pullEvents().map((e) => e.eventType)).toContain('listing.delisted.v1');
  });
});
