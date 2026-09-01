import { DomainEvent } from './domain-event';
import { StoredEvent } from './ports/event-store.port';

/** Generic free-form metadata attached to domain aggregates/commands. */
export type DomainMetadata = Record<string, unknown>;

export abstract class AggregateRoot {
  protected _version = 0;
  private _events: DomainEvent[] = [];

  get version(): number {
    return this._version;
  }

  protected incrementVersion(): void {
    this._version += 1;
  }

  protected raise(event: DomainEvent): void {
    this._events.push(event);
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }

  /** Returns the collected events without clearing them. */
  getUnpublishedEvents(): DomainEvent[] {
    return [...this._events];
  }

  /**
   * Apply a stored event during aggregate reconstruction (event replay).
   * Delegates to the concrete aggregate's `when()` method.
   */
  apply(storedEvent: StoredEvent): void {
    this._version = storedEvent.version;
    this.when(storedEvent);
  }

  /**
   * When: apply a domain event to mutate aggregate state.
   * Subclasses should override this to handle each event type
   * for full event sourcing support. Called during event replay.
   * Default implementation is a no-op for backward compatibility.
   */
  protected when(event: StoredEvent): void {
    // Default no-op — override in event-sourced aggregates
  }
}
