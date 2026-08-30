import { DomainEvent, OutboxPublisher } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

export type EventListener = (event: DomainEvent) => Promise<void> | void;

@Injectable()
export class InMemoryOutboxPublisher implements OutboxPublisher {
  private readonly published: DomainEvent[] = [];
  private readonly listeners: EventListener[] = [];

  onEvent(listener: EventListener): void {
    this.listeners.push(listener);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.published.push(event);
      for (const listener of this.listeners) {
        await listener(event);
      }
    }
  }

  getPublished(): DomainEvent[] {
    return [...this.published];
  }

  clear(): void {
    this.published.length = 0;
  }
}
