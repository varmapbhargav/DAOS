import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'listing.published.v1': 'marketplace-events',
  'listing.suspended.v1': 'marketplace-events',
  'listing.delisted.v1': 'marketplace-events',
  'order.placed.v1': 'marketplace-events',
  'order.filled.v1': 'marketplace-events',
  'order.partially-filled.v1': 'marketplace-events',
  'order.cancelled.v1': 'marketplace-events',
  'trade.executed.v1': 'marketplace-events',
};

@Injectable()
export class MarketplaceKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
