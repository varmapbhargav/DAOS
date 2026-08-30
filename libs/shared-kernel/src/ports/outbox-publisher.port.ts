import { DomainEvent } from '../domain-event';

export interface OutboxPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}
