export class Decimal {
  private readonly value: string;
  private readonly scale: number;

  constructor(value: number | string, scale: number = 10) {
    if (typeof value === 'number') {
      this.value = value.toFixed(scale);
    } else {
      this.value = value;
    }
    this.scale = scale;
  }

  static zero(scale: number = 10): Decimal {
    return new Decimal('0', scale);
  }

  static fromString(value: string, scale: number = 10): Decimal {
    return new Decimal(value, scale);
  }

  add(other: Decimal): Decimal {
    const a = this.toNumber();
    const b = other.toNumber();
    return new Decimal(a + b, Math.max(this.scale, other.scale));
  }

  subtract(other: Decimal): Decimal {
    const a = this.toNumber();
    const b = other.toNumber();
    return new Decimal(a - b, Math.max(this.scale, other.scale));
  }

  multiply(other: Decimal): Decimal {
    const a = this.toNumber();
    const b = other.toNumber();
    return new Decimal(a * b, this.scale + other.scale);
  }

  divide(other: Decimal): Decimal {
    const a = this.toNumber();
    const b = other.toNumber();
    if (b === 0) throw new Error('Division by zero');
    return new Decimal(a / b, Math.max(this.scale, other.scale));
  }

  pow(exponent: number): Decimal {
    return new Decimal(Math.pow(this.toNumber(), exponent), this.scale * exponent);
  }

  abs(): Decimal {
    return new Decimal(Math.abs(this.toNumber()), this.scale);
  }

  gt(other: Decimal): boolean {
    return this.toNumber() > other.toNumber();
  }

  gte(other: Decimal): boolean {
    return this.toNumber() >= other.toNumber();
  }

  lt(other: Decimal): boolean {
    return this.toNumber() < other.toNumber();
  }

  lte(other: Decimal): boolean {
    return this.toNumber() <= other.toNumber();
  }

  eq(other: Decimal): boolean {
    return this.toNumber() === other.toNumber();
  }

  max(other: Decimal): Decimal {
    return this.gt(other) ? this : other;
  }

  min(other: Decimal): Decimal {
    return this.lt(other) ? this : other;
  }

  toNumber(): number {
    return parseFloat(this.value);
  }

  toFixed(scale: number = this.scale): string {
    return this.toNumber().toFixed(scale);
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}

export class Percentage {
  private readonly basisPoints: number;

  private constructor(basisPoints: number) {
    this.basisPoints = basisPoints;
  }

  static fromDecimal(value: Decimal): Percentage {
    return new Percentage(Math.round(value.toNumber() * 10000));
  }

  static fromNumber(value: number): Percentage {
    return new Percentage(Math.round(value * 10000));
  }

  static fromBasisPoints(basisPoints: number): Percentage {
    return new Percentage(basisPoints);
  }

  toDecimal(): Decimal {
    return new Decimal(this.basisPoints / 10000);
  }

  toNumber(): number {
    return this.basisPoints / 10000;
  }

  toPercentString(): string {
    return `${(this.basisPoints / 100).toFixed(2)}%`;
  }

  add(other: Percentage): Percentage {
    return new Percentage(this.basisPoints + other.basisPoints);
  }

  subtract(other: Percentage): Percentage {
    return new Percentage(this.basisPoints - other.basisPoints);
  }

  multiply(factor: number): Percentage {
    return new Percentage(Math.round(this.basisPoints * factor));
  }

  gt(other: Percentage): boolean {
    return this.basisPoints > other.basisPoints;
  }

  lt(other: Percentage): boolean {
    return this.basisPoints < other.basisPoints;
  }
}

export class Money {
  private readonly cents: number;
  private readonly currency: string;

  constructor(amount: number | Decimal, currency: string = 'USD') {
    if (amount instanceof Decimal) {
      this.cents = Math.round(amount.toNumber() * 100);
    } else {
      this.cents = Math.round(amount * 100);
    }
    this.currency = currency;
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  getAmount(): Decimal {
    return new Decimal(this.cents / 100);
  }

  getCents(): number {
    return this.cents;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
    const m = new Money(0, this.currency);
    (m as any).cents = this.cents + other.cents;
    return m;
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
    const m = new Money(0, this.currency);
    (m as any).cents = this.cents - other.cents;
    return m;
  }

  multiply(factor: number | Decimal): Money {
    const factorNum = factor instanceof Decimal ? factor.toNumber() : factor;
    const m = new Money(0, this.currency);
    (m as any).cents = Math.round(this.cents * factorNum);
    return m;
  }

  divide(divisor: number | Decimal): Money {
    const divisorNum = divisor instanceof Decimal ? divisor.toNumber() : divisor;
    if (divisorNum === 0) throw new Error('Division by zero');
    const m = new Money(0, this.currency);
    (m as any).cents = Math.round(this.cents / divisorNum);
    return m;
  }

  gt(other: Money): boolean {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return this.cents > other.cents;
  }

  lt(other: Money): boolean {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return this.cents < other.cents;
  }

  toString(): string {
    return `${(this.cents / 100).toFixed(2)} ${this.currency}`;
  }

  toJSON(): object {
    return { amount: this.cents / 100, currency: this.currency };
  }
}