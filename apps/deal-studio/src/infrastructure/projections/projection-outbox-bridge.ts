import { DomainEvent, OutboxPublisher, ProjectionHandler } from '@daos/shared-kernel';
import { Injectable, Logger } from '@nestjs/common';

export type ProjectionEventListener = (event: DomainEvent) => Promise<void>;

/**
 * Bridges the outbox publisher to projection handlers.
 * When events are published to the outbox, they are also forwarded
 * to registered projection handlers to update read models.
 */
@Injectable()
export class ProjectionOutboxBridge implements OutboxPublisher {
  private readonly logger = new Logger(ProjectionOutboxBridge.name);
  private readonly handlers: ProjectionHandler[] = [];

  constructor(private readonly delegate: OutboxPublisher) {}

  addHandler(handler: ProjectionHandler): void {
    this.handlers.push(handler);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    await this.delegate.publish(events);

    for (const event of events) {
      for (const handler of this.handlers) {
        try {
          await handler.handle(event);
        } catch (err) {
          this.logger.error(
            `Projection handler error for ${event.eventType}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }
  }
}
