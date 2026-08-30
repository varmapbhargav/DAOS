import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'settlement.initiated.v1': 'settlement-events',
  'settlement.matched.v1': 'settlement-events',
  'trade.settled.v1': 'settlement-events',
  'settlement.failed.v1': 'settlement-events',
  'custody.updated.v1': 'settlement-events',
};

@Injectable()
export class SettlementKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
