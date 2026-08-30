import { IdempotencyStore } from '@daos/shared-kernel';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { IDEMPOTENCY_STORE, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InMemoryOutboxPublisher } from '../../infrastructure/messaging/in-memory-outbox';

@Injectable()
export class OutboxDispatcher implements OnModuleInit {
  private readonly logger = new Logger(OutboxDispatcher.name);

  constructor(
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: InMemoryOutboxPublisher,
    @Inject(IDEMPOTENCY_STORE) private readonly idempotency: IdempotencyStore,
  ) {}

  onModuleInit(): void {
    this.outbox.onEvent(async (event) => {
      if (await this.idempotency.seen(event.eventId)) return;
      await this.idempotency.mark(event.eventId);
      this.logger.log(`[audit] ${event.eventType} aggregate=${event.aggregateId} tenant=${event.tenantId}`);
    });
  }
}
