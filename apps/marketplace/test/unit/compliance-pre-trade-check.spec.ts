import { ListingId, ListingStatus, ListingType, Money, TenantId, TradingMechanism } from '@daos/shared-kernel';

import { Listing } from '../../src/domain/aggregates/listing.aggregate';
import { CompliancePreTradeCheck } from '../../src/domain/services/compliance-pre-trade-check';

describe('CompliancePreTradeCheck', () => {
  const check = new CompliancePreTradeCheck();
  const tenantId = TenantId.create('tenant-1');

  function activeListing(status: ListingStatus = 'active'): Listing {
    return Listing.reconstruct({
      id: ListingId.create('listing-1'),
      tenantId,
      productId: 'product-1',
      issueId: null,
      listingType: 'secondary' as ListingType,
      mechanism: 'orderBook' as TradingMechanism,
      currency: 'USD',
      totalQuantity: 1000n,
      minimumQuantity: 10n,
      referencePrice: Money.of(100n, 'USD'),
      session: { openAt: '09:00', closeAt: '17:00', timezone: 'UTC' },
      status,
      version: 1,
    });
  }

  it('allows a compliant order', () => {
    const result = check.check({
      listing: activeListing(),
      quantity: 100n,
      price: { amount: '100', currency: 'USD' },
      investorRisk: { kycApproved: true, isAccredited: true },
    });

    expect(result.allowed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('rejects a non-active listing', () => {
    const result = check.check({
      listing: activeListing('suspended'),
      quantity: 100n,
      price: { amount: '100', currency: 'USD' },
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain('Listing is not active');
  });

  it('rejects quantity exceeding the listing total', () => {
    const result = check.check({
      listing: activeListing(),
      quantity: 2000n,
      price: { amount: '100', currency: 'USD' },
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain('Quantity exceeds listing total quantity');
  });

  it('rejects non-positive price and quantity', () => {
    const result = check.check({
      listing: activeListing(),
      quantity: 0n,
      price: { amount: '0', currency: 'USD' },
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining(['Quantity must be positive', 'Price must be positive']),
    );
  });

  it('rejects flagged or non-accredited investors', () => {
    const result = check.check({
      listing: activeListing(),
      quantity: 100n,
      price: { amount: '100', currency: 'USD' },
      investorRisk: { flagged: true, kycApproved: true, isAccredited: false },
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining(['Investor is flagged', 'Investor is not accredited']),
    );
  });
});
