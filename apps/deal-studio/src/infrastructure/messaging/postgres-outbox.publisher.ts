import { DomainEvent, OutboxPublisher } from '@daos/shared-kernel';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { OutboxEventOrmEntity } from '../persistence/entities/outbox-event.orm-entity';

export type OutboxEventStatus = 'PENDING' | 'PUBLISHED' | 'FAILED' | 'DEAD';

/**
 * Transactional outbox publisher.
 * Events are persisted to the outbox table in the same DB transaction as the
 * aggregate state. A separate relay worker (KafkaOutboxRelay) reads PENDING
 * rows and forwards them to Kafka, then marks them PUBLISHED.
 */
@Injectable()
export class PostgresOutboxPublisher implements OutboxPublisher {
  private readonly logger = new Logger(PostgresOutboxPublisher.name);

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async publish(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    const rows: OutboxEventOrmEntity[] = events.map((e) => {
      const row = new OutboxEventOrmEntity();
      row.eventId = e.eventId;
      row.eventType = e.eventType;
      row.aggregateId = e.aggregateId;
      row.tenantId = e.tenantId ?? '';
      row.occurredAt = e.occurredAt;
      row.correlationId = e.correlationId;
      row.causationId = e.causationId;
      row.payload = JSON.parse(JSON.stringify(e));
      row.status = 'PENDING';
      row.retryCount = 0;
      row.lastErrorAt = null;
      row.lastError = null;
      row.publishedAt = null;
      return row;
    });

    try {
      await this.ds
        .getRepository(OutboxEventOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(OutboxEventOrmEntity)
        .values(rows)
        .orIgnore() // idempotent — duplicate eventId is silently skipped
        .execute();
    } catch (err) {
      this.logger.error('Failed to persist outbox events', err);
      throw err;
    }
  }
}
