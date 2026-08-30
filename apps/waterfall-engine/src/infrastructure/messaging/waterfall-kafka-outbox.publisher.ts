import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'waterfall.model-approved.v1': 'waterfall-engine-events',
  'distribution.calculated.v1': 'waterfall-engine-events',
  'distribution.declared.v1': 'waterfall-engine-events',
  'distribution.approved.v1': 'waterfall-engine-events',
  'distribution.paid.v1': 'waterfall-engine-events',
  'promote.distributed.v1': 'waterfall-engine-events',
  'corporate-action.announced.v1': 'waterfall-engine-events',
  'election.closed.v1': 'waterfall-engine-events',
  'corporate-action.executed.v1': 'waterfall-engine-events',
};

@Injectable()
export class WaterfallKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
