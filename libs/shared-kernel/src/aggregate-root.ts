import { DomainEvent } from './domain-event';

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
}
