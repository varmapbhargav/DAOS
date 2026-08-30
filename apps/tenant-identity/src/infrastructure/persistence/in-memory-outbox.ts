import { Injectable } from '@nestjs/common';

import { DomainEvent, OutboxPublisher } from '@daos/shared-kernel';

/**
 * In-memory outbox publisher.
 * Stores events in an array until dispatched.
 * Used for local development and testing.
 */
@Injectable()
export class InMemoryOutboxPublisher implements OutboxPublisher {
  private readonly queue: DomainEvent[] = [];

  publish(events: DomainEvent[]): Promise<void> {
    this.queue.push(...events);
    return Promise.resolve();
  }

  getQueue(): DomainEvent[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue.length = 0;
  }
}
