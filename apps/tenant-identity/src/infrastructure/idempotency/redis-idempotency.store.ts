import { IdempotencyStore } from '@daos/shared-kernel';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisIdempotencyStore implements IdempotencyStore {
  /** TTL for idempotency keys: 7 days (matches refresh token lifetime) */
  private readonly ttlSeconds = 7 * 24 * 60 * 60;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async seen(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async mark(key: string): Promise<void> {
    await this.redis.set(key, '1', 'EX', this.ttlSeconds);
  }
}
