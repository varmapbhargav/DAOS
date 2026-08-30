import { DomainEvent, OutboxPublisher } from '../index';
import { Logger } from '@nestjs/common';

export interface KafkaProducerPort {
  send(topic: string, key: string, value: string): Promise<void>;
}

/**
 * Base Kafka outbox relay.
 * Subclasses provide a `topicFor(eventType)` mapping and inject
 * a concrete `KafkaProducerPort` implementation.
 *
 * The relay serialises each DomainEvent to JSON and publishes to the
 * appropriate Kafka topic. Event ordering is guaranteed per-aggregate
 * (using aggregateId as the partition key).
 */
export abstract class KafkaOutboxRelay implements OutboxPublisher {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly producer: KafkaProducerPort) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const topic = this.topicFor(event.eventType);
      if (!topic) {
        this.logger.warn(`No Kafka topic mapping for event type: ${event.eventType}`);
        continue;
      }
      const payload = JSON.stringify({
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        tenantId: event.tenantId,
        occurredAt: event.occurredAt,
        correlationId: event.correlationId,
        causationId: event.causationId,
        schemaVersion: event.schemaVersion,
        data: this.serializeEvent(event),
      });
      await this.producer.send(topic, event.aggregateId, payload);
      this.logger.debug(`Published ${event.eventType} → ${topic}`);
    }
  }

  /** Map an event type string to a Kafka topic name. Return null to skip. */
  protected abstract topicFor(eventType: string): string | null;

  /** Serialize domain-specific event fields. Default: spread all own properties. */
  protected serializeEvent(event: DomainEvent): Record<string, unknown> {
    const { eventId, aggregateId, tenantId, occurredAt, correlationId, causationId, schemaVersion, ...rest } = event as DomainEvent & Record<string, unknown>;
    void eventId; void aggregateId; void tenantId; void occurredAt;
    void correlationId; void causationId; void schemaVersion;
    return rest as Record<string, unknown>;
  }
}
