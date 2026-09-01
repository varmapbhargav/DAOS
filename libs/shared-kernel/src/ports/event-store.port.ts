import { DomainEvent } from '../domain-event';

export interface StoredEvent {
  eventId: string;
  aggregateId: string;
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
  version: number;
  occurredAt: string;
  correlationId: string;
  causationId: string | null;
  schemaVersion: number;
}

export interface EventStore {
  append(events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, tenantId: string, fromVersion?: number): Promise<StoredEvent[]>;
  getEventsByType(eventType: string, tenantId: string, limit?: number): Promise<StoredEvent[]>;
}
