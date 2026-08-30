import { Money, ShareClassId, TenantId } from '@daos/shared-kernel';

import { ShareClass } from '../../src/domain/entities/share-class.aggregate';

const tenantId = TenantId.create('tenant-shareclass');

function create(): ShareClass {
  return ShareClass.create({
    tenantId,
    productId: 'product-1',
    name: 'Class A',
    currency: 'USD',
    targetSize: Money.of(50_000_000n, 'USD'),
    minInvestment: Money.of(100_000n, 'USD'),
    maxInvestors: 1000,
  });
}

describe('ShareClass aggregate', () => {
  it('creates in draft status with a share class created event', () => {
    const shareClass = create();
    expect(shareClass.status).toBe('draft');
    expect(shareClass.name).toBe('Class A');
    expect(shareClass.productId).toBe('product-1');
    expect(shareClass.pricePerShare).toBeNull();
    const events = shareClass.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('product.share-class.created.v1');
  });

  it('requires a non-empty name', () => {
    expect(() =>
      ShareClass.create({
        tenantId,
        productId: 'product-1',
        name: '   ',
        currency: 'USD',
        targetSize: Money.of(50_000_000n, 'USD'),
        minInvestment: Money.of(100_000n, 'USD'),
        maxInvestors: 100,
      }),
    ).toThrow('Share class name is required');
  });

  it('sets a price per share', () => {
    const shareClass = create();
    shareClass.setPrice(Money.of(100_000n, 'USD'));
    expect(shareClass.pricePerShare?.amount).toBe(100_000n);
  });

  it('activates with a default price when none set', () => {
    const shareClass = create();
    shareClass.activate();
    expect(shareClass.status).toBe('active');
    expect(shareClass.pricePerShare?.amount).toBe(0n);
  });

  it('closes and refuses to reprice afterwards', () => {
    const shareClass = create();
    shareClass.close();
    expect(shareClass.status).toBe('closed');
    expect(() => shareClass.setPrice(Money.of(5n, 'USD'))).toThrow('Closed share classes cannot be repriced');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = create();
    original.setPrice(Money.of(90_000n, 'USD'));
    original.activate();
    const clone = ShareClass.reconstruct({
      id: ShareClassId.create(original.id.value),
      tenantId: original.tenantId,
      productId: original.productId,
      name: original.name,
      currency: original.currency,
      targetSize: original.targetSize,
      minInvestment: original.minInvestment,
      maxInvestors: original.maxInvestors,
      pricePerShare: original.pricePerShare,
      status: original.status,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('active');
    expect(clone.pricePerShare?.amount).toBe(90_000n);
  });
});
