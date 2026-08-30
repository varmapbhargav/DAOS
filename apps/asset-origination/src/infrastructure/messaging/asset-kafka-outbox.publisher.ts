import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'asset.originated.v1': 'asset-events',
  'asset.due-diligence.completed.v1': 'asset-events',
  'asset.valuation.updated.v1': 'asset-valuation-events',
  'asset.approved.v1': 'asset-events',
  'asset.rejected.v1': 'asset-events',
};

/**
 * Kafka outbox relay for asset-origination domain events.
 * Ingests an injected KafkaProducerPort (KafkaJS adapter).
 */
@Injectable()
export class AssetKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
