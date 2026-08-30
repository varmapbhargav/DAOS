import { ClosingId, TenantId } from '@daos/shared-kernel';

import { Closing } from '../../src/domain/aggregates/closing.aggregate';

const tenantId = TenantId.create('tenant-dist');

function schedule(): Closing {
  return Closing.schedule({ tenantId, productId: 'product-1', closesAt: '2026-10-01T00:00:00Z' });
}

describe('Closing aggregate', () => {
  it('schedules in scheduled state', () => {
    const c = schedule();
    expect(c.status).toBe('scheduled');
    expect(c.productId).toBe('product-1');
    expect(c.closesAt).toBe('2026-10-01T00:00:00Z');
    expect(c.completedAt).toBeNull();
    expect(c.version).toBe(1);
  });

  it('requires a product id', () => {
    expect(() => Closing.schedule({ tenantId, productId: ' ', closesAt: 'x' })).toThrow('Product id is required');
  });

  it('opens then soft closes', () => {
    const c = schedule();
    c.open();
    expect(c.status).toBe('open');
    c.softClose();
    expect(c.status).toBe('soft');
  });

  it('hard closes an open closing and raises event', () => {
    const c = schedule();
    c.open();
    c.hardClose();
    expect(c.status).toBe('hard');
    expect(c.completedAt).not.toBeNull();
    expect(c.pullEvents().map((e) => e.eventType)).toContain('closing.completed.v1');
  });

  it('hard closes a soft closing', () => {
    const c = schedule();
    c.open();
    c.softClose();
    c.hardClose();
    expect(c.status).toBe('hard');
  });

  it('refuses to complete a scheduled closing', () => {
    const c = schedule();
    expect(() => c.hardClose()).toThrow('Closing must be open or soft to complete');
  });

  it('refuses to open a non-scheduled closing', () => {
    const c = schedule();
    c.open();
    c.softClose();
    expect(() => c.open()).toThrow('Only scheduled closings can be opened');
  });

  it('refuses to soft close a non-open closing', () => {
    const c = schedule();
    expect(() => c.softClose()).toThrow('Only open closings can soft close');
  });

  it('reconstructs preserving version', () => {
    const c = schedule();
    const clone = Closing.reconstruct({
      id: ClosingId.create(c.id.value),
      tenantId: c.tenantId,
      productId: c.productId,
      status: c.status,
      closesAt: c.closesAt,
      completedAt: c.completedAt,
      version: c.version,
    });
    expect(clone.version).toBe(c.version);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});
