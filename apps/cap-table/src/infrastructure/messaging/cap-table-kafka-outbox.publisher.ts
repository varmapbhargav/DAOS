import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'cap-table.updated.v1': 'cap-table-events',
  'cap-table.transfer-recorded.v1': 'cap-table-events',
  'cap-table.synced.v1': 'cap-table-events',
};

/**
 * Kafka outbox relay for cap-table domain events.
 */
@Injectable()
export class CapTableKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}