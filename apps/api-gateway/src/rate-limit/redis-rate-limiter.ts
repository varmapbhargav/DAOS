import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { RateLimiter } from './rate-limiter.port';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Uses a sorted set per key, timestamp-scored. Atomic via a single
 * Lua script to avoid race conditions.
 */
@Injectable()
export class RedisRateLimiter implements RateLimiter {
  private readonly script = `
    local key    = KEYS[1]
    local now    = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit  = tonumber(ARGV[3])
    local cutoff = now - window
    redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
    local count = redis.call('ZCARD', key)
    if count >= limit then
      return 0
    end
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
  `;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async allow(key: string): Promise<boolean> {
    const windowMs = Number(process.env['RATE_LIMIT_WINDOW_MS'] ?? 60000);
    const max = Number(process.env['RATE_LIMIT_MAX'] ?? 1000);

    const allowed = (await this.redis.eval(
      this.script,
      1,
      `rl:${key}`,
      Date.now().toString(),
      windowMs.toString(),
      max.toString(),
    )) as number;

    return allowed === 1;
  }
}
