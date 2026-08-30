import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'subscription.received.v1': 'distribution-events',
  'subscription.documents-sent.v1': 'distribution-events',
  'subscription.executed.v1': 'distribution-events',
  'allocation.approved.v1': 'distribution-events',
  'subscription.funded.v1': 'distribution-events',
  'subscription.rejected.v1': 'distribution-events',
  'capital-call.issued.v1': 'distribution-events',
  'capital-call.funded.v1': 'distribution-events',
  'closing.completed.v1': 'distribution-events',
};

@Injectable()
export class DistributionKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
