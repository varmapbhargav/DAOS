import { DomainEvent, OutboxPublisher } from '@daos/shared-kernel';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

import { OutboxEventOrmEntity } from '../persistence/entities/outbox-event.orm-entity';

@Injectable()
export class PostgresOutboxPublisher implements OutboxPublisher {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async publish(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    const queryRunner = this.ds.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const event of events) {
        const outboxEvent = new OutboxEventOrmEntity();
        outboxEvent.id = event.eventId;
        outboxEvent.tenantId = event.tenantId ?? '';
        outboxEvent.aggregateId = event.aggregateId;
        outboxEvent.aggregateType = event.constructor.name.replace('Event', '');
        outboxEvent.eventType = event.eventType;
        outboxEvent.eventVersion = event.schemaVersion;
        // Serialize event's own properties (excluding base class properties) as payload
        const baseKeys = ['eventId', 'occurredAt', 'correlationId', 'causationId', 'schemaVersion', 'aggregateId', 'tenantId'];
        const payload: Record<string, unknown> = {};
        for (const key of Object.keys(event)) {
          if (!baseKeys.includes(key)) {
            payload[key] = (event as any)[key];
          }
        }
        outboxEvent.payload = payload;
        outboxEvent.correlationId = event.correlationId ?? null;
        outboxEvent.causationId = event.causationId ?? null;
        outboxEvent.actorId = null;
        outboxEvent.occurredAt = new Date(event.occurredAt);
        outboxEvent.publishedAt = null;
        outboxEvent.retryCount = 0;
        outboxEvent.lastError = null;

        await queryRunner.manager.save(outboxEvent);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}