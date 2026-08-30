import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'investor.kyc.submitted.v1': 'investor-kyc-events',
  'investor.kyc.approved.v1': 'investor-kyc-events',
  'investor.kyc.rejected.v1': 'investor-kyc-events',
  'investor.accreditation.verified.v1': 'investor-accreditation-events',
  'investor.accreditation.expired.v1': 'investor-accreditation-events',
  'investor.wallet.linked.v1': 'investor-events',
  'investor.approved.v1': 'investor-events',
  'investor.suspended.v1': 'investor-events',
};

/**
 * Kafka outbox relay for investor bounded-context domain events.
 * Ingests an injected KafkaProducerPort (KafkaJS adapter).
 */
@Injectable()
export class InvestorKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
