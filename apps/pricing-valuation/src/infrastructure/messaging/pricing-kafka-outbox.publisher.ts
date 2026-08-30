import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'price.updated.v1': 'pricing-valuation-events',
  'price.stale-detected.v1': 'pricing-valuation-events',
  'valuation.discrepancy-detected.v1': 'pricing-valuation-events',
  'valuation.model-run.v1': 'pricing-valuation-events',
  'valuation.approved.v1': 'pricing-valuation-events',
  'valuation.rejected.v1': 'pricing-valuation-events',
};

@Injectable()
export class PricingKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
