import { Money } from './money';

describe('Money', () => {
  it('creates from bigint minor units', () => {
    const m = Money.of(1000n, 'USD');
    expect(m.amount).toBe(1000n);
    expect(m.currency).toBe('USD');
  });
  it('rejects invalid currency', () => {
    expect(() => Money.of(1n, 'us')).toThrow('Invalid ISO currency');
  });
  it('adds same currency', () => {
    expect(Money.of(100n, 'USD').add(Money.of(50n, 'USD')).amount).toBe(150n);
  });
  it('rejects add across currencies', () => {
    expect(() => Money.of(1n, 'USD').add(Money.of(1n, 'EUR'))).toThrow('Currency mismatch');
  });
  it('supports deep equality', () => {
    expect(Money.of(100n, 'USD').equals(Money.of(100n, 'USD'))).toBe(true);
    expect(Money.of(100n, 'USD').equals(Money.of(100n, 'EUR'))).toBe(false);
  });
});
