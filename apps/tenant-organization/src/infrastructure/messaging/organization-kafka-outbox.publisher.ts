import { KafkaOutboxRelay, KafkaProducerPort } from '@daos/shared-kernel/infrastructure';
import { Injectable } from '@nestjs/common';

const EVENT_TOPICS: Record<string, string> = {
  'organization.profile-updated.v1': 'organization-events',
  'organization.billing-plan-changed.v1': 'organization-events',
  'organization.payment-method-updated.v1': 'organization-events',
  'organization.usage-recorded.v1': 'organization-events',
  'organization.subscription-canceled.v1': 'organization-events',
  'organization.api-key-issued.v1': 'organization-events',
  'organization.api-key-rotated.v1': 'organization-events',
  'organization.api-key-revoked.v1': 'organization-events',
};

@Injectable()
export class OrganizationKafkaOutboxPublisher extends KafkaOutboxRelay {
  constructor(producer: KafkaProducerPort) {
    super(producer);
  }

  protected topicFor(eventType: string): string | null {
    return EVENT_TOPICS[eventType] ?? null;
  }
}
