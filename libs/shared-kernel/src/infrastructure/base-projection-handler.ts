import { DomainEvent } from '../domain-event';
import { ProjectionHandler } from '../ports/projection.port';

/**
 * Base class for CQRS projection handlers.
 * Subclasses implement `handle()` to update read model tables
 * when specific domain events are received.
 *
 * Usage:
 *   @Injectable()
 *   class DealSummaryProjection extends BaseProjectionHandler {
 *     protected async project(event: DomainEvent): Promise<void> {
 *       switch (event.eventType) {
 *         case 'DealCreated': return this.onDealCreated(event);
 *         ...
 *       }
 *     }
 *   }
 */
export abstract class BaseProjectionHandler implements ProjectionHandler {
  async handle(event: DomainEvent): Promise<void> {
    try {
      await this.project(event);
    } catch (err) {
      this.logError(err, event);
    }
  }

  protected abstract project(event: DomainEvent): Promise<void>;

  protected logError(err: unknown, event: DomainEvent): void {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[Projection] Error projecting ${event.eventType} for aggregate ${event.aggregateId}: ${message}`,
    );
  }
}
