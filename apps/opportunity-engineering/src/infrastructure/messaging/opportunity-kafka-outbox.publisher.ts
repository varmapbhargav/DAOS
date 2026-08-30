import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'opportunity.engineered.v1': 'opportunity-events',
  'opportunity.scenario.approved.v1': 'opportunity-events',
  'opportunity.approved.v1': 'opportunity-events',
  'opportunity.rejected.v1': 'opportunity-events',
  'opportunity.structure.optimized.v1': 'opportunity-events',
};

/**
 * Kafka outbox relay for opportunity-engineering domain events.
 * Ingests an injected KafkaProducerPort (KafkaJS adapter).
 */
@Injectable()
export class OpportunityKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
