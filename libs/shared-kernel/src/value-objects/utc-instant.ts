export class UtcInstant {
  private constructor(private readonly epochMs: number) {}

  static now(): UtcInstant {
    return new UtcInstant(Date.now());
  }

  static from(date: Date): UtcInstant {
    return new UtcInstant(date.getTime());
  }

  static fromIso(iso: string): UtcInstant {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) throw new Error(`Invalid ISO date: ${iso}`);
    return new UtcInstant(t);
  }

  toDate(): Date {
    return new Date(this.epochMs);
  }

  toIso(): string {
    return new Date(this.epochMs).toISOString();
  }

  isBefore(other: UtcInstant): boolean {
    return this.epochMs < other.epochMs;
  }

  equals(other: UtcInstant): boolean {
    return this.epochMs === other.epochMs;
  }
}
