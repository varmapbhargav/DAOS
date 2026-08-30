import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { DomainEvent, OutboxPublisher } from '@daos/shared-kernel';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Redis-based outbox publisher.
 * Publishes domain events to Redis Streams for eventual relay to Kafka.
 */
@Injectable()
export class RedisOutboxPublisher implements OutboxPublisher {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.redis.xadd(
        `outbox:${event.tenantId}:${event.eventType}`,
        'MAXLEN',
        '~',
        '10000',
        '*',
        'payload',
        JSON.stringify({
          eventId: event.eventId,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          tenantId: event.tenantId,
          occurredAt: event.occurredAt,
          correlationId: event.correlationId,
          causationId: event.causationId,
          schemaVersion: event.schemaVersion,
          data: event,
        }),
      );
    }
  }
}
