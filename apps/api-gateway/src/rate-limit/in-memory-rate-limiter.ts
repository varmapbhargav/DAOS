import { Injectable } from '@nestjs/common';

import { RateLimiter } from './rate-limiter.port';

@Injectable()
export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly max: number = Number(process.env.RATE_LIMIT_MAX ?? 1000),
    private readonly windowMs: number = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  ) {}

  async allow(key: string): Promise<boolean> {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
