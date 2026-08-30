import { Percentage } from './percentage';
import { UtcInstant } from './utc-instant';

describe('Percentage', () => {
  it('converts percent to fraction and back', () => {
    expect(Percentage.fromPercent(12.5).fraction).toBeCloseTo(0.125);
    expect(Percentage.fromFraction(0.5).toPercent()).toBe(50);
  });
  it('rejects negative', () => {
    expect(() => Percentage.fromFraction(-1)).toThrow();
  });
});

describe('UtcInstant', () => {
  it('round-trips ISO', () => {
    const iso = '2026-01-01T00:00:00.000Z';
    expect(UtcInstant.fromIso(iso).toIso()).toBe(iso);
  });
  it('orders instants', () => {
    const a = UtcInstant.fromIso('2026-01-01T00:00:00.000Z');
    const b = UtcInstant.fromIso('2026-01-02T00:00:00.000Z');
    expect(a.isBefore(b)).toBe(true);
  });
});
