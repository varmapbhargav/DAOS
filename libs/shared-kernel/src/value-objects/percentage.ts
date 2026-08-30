export class Percentage {
  private constructor(public readonly value: string) {}

  static fromFraction(fraction: string): Percentage {
    const num = parseFloat(fraction);
    if (Number.isNaN(num)) throw new Error('Invalid fraction');
    if (num < 0) throw new Error('Percentage cannot be negative');
    return new Percentage(fraction);
  }

  static fromPercent(percent: string): Percentage {
    return Percentage.fromFraction(percent + '/100');
  }

  toFraction(): string {
    return this.value;
  }

  toPercent(): number {
    return parseFloat(this.value) * 100;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }
}
