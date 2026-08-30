import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'entity.formed.v1': 'legal-entity-events',
  'entity.activated.v1': 'legal-entity-events',
  'entity.hierarchy.updated.v1': 'legal-entity-events',
  'entity.dissolved.v1': 'legal-entity-events',
  'entity.document.generated.v1': 'corporate-document-events',
  'entity.registered-agent.appointed.v1': 'legal-entity-events',
};

/**
 * Kafka outbox relay for legal-entity-studio domain events.
 */
@Injectable()
export class EntityKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
