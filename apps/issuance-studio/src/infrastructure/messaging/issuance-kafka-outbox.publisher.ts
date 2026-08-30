import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'issuance.created.v1': 'issuance-events',
  'issuance.legal-docs.signed.v1': 'issuance-events',
  'issuance.token.minted.v1': 'issuance-events',
  'issuance.whitelist.updated.v1': 'issuance-events',
  'issuance.transfer-restriction.applied.v1': 'issuance-events',
  'issuance.cap-table.synced.v1': 'issuance-events',
};

/**
 * Kafka outbox relay for issuance-studio domain events.
 */
@Injectable()
export class IssuanceKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}