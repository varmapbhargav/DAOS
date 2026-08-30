import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'product.designed.v1': 'product-events',
  'product.share-class.created.v1': 'product-events',
  'product.fee-structure.approved.v1': 'product-events',
  'product.approved.v1': 'product-events',
  'product.closed.v1': 'product-events',
};

/**
 * Kafka outbox relay for product-design-studio domain events.
 * Ingests an injected KafkaProducerPort (KafkaJS adapter).
 */
@Injectable()
export class ProductKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
