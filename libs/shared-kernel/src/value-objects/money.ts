export class Money {
  private constructor(
    public readonly amount: bigint,
    public readonly currency: string,
  ) {}

  static of(amount: bigint, currency: string): Money {
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error(`Invalid ISO currency: ${currency}`);
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return Money.of(0n, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount - other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
