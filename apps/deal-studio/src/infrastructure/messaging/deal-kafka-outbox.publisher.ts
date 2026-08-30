import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'deal.structured.v1': 'deal-events',
  'deal.term-sheet.finalized.v1': 'deal-events',
  'deal.closing-condition.met.v1': 'deal-events',
  'deal.approved.v1': 'deal-events',
  'deal.closed.v1': 'deal-events',
  'deal.cancelled.v1': 'deal-events',
};

/**
 * Kafka outbox relay for deal-studio domain events.
 * Ingests an injected KafkaProducerPort (KafkaJS adapter).
 */
@Injectable()
export class DealKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
