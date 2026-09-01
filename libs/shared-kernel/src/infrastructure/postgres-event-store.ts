import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ConflictError } from '../errors';
import { DomainEvent } from '../domain-event';
import { EventStore, StoredEvent } from '../ports/event-store.port';
import { EventStoreEntity } from './event-store-entity';

@Injectable()
export class PostgresEventStore implements EventStore {
  private readonly logger = new Logger(PostgresEventStore.name);

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async append(events: DomainEvent[], expectedVersion: number): Promise<void> {
    if (events.length === 0) return;

    const firstAggregateId = events[0].aggregateId;
    const tenantId = events[0].tenantId ?? '';

    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId}'`);

      const currentMax = await mgr.query(
        `SELECT COALESCE(MAX(version), 0) AS max_version FROM event_store WHERE aggregate_id = $1 AND tenant_id = $2`,
        [firstAggregateId, tenantId],
      );

      const currentVersion = parseInt(currentMax[0]?.max_version ?? '0', 10);

      if (currentVersion !== expectedVersion) {
        throw new ConflictError(
          `Concurrency conflict for aggregate ${firstAggregateId}: ` +
          `expected version ${expectedVersion}, found ${currentVersion}`,
        );
      }

      let version = expectedVersion;
      for (const event of events) {
        version += 1;
        const row = new EventStoreEntity();
        row.eventId = event.eventId;
        row.aggregateId = event.aggregateId;
        row.tenantId = event.tenantId ?? '';
        row.eventType = event.eventType;
        row.payload = JSON.parse(JSON.stringify(event));
        row.version = version;
        row.occurredAt = event.occurredAt;
        row.correlationId = event.correlationId;
        row.causationId = event.causationId;
        row.schemaVersion = event.schemaVersion;

        await mgr
          .getRepository(EventStoreEntity)
          .createQueryBuilder()
          .insert()
          .into(EventStoreEntity)
          .values(row)
          .orIgnore()
          .execute();
      }
    });

    this.logger.debug(
      `Appended ${events.length} events for aggregate ${firstAggregateId} (v${expectedVersion} → v${events.length + expectedVersion})`,
    );
  }

  async getEvents(aggregateId: string, tenantId: string, fromVersion = 0): Promise<StoredEvent[]> {
    const rows = await this.ds
      .getRepository(EventStoreEntity)
      .createQueryBuilder('e')
      .where('e.aggregate_id = :aggregateId AND e.tenant_id = :tenantId AND e.version > :fromVersion', {
        aggregateId,
        tenantId,
        fromVersion,
      })
      .orderBy('e.version', 'ASC')
      .getMany();

    return rows.map(this.toStoredEvent);
  }

  async getEventsByType(eventType: string, tenantId: string, limit = 100): Promise<StoredEvent[]> {
    const rows = await this.ds
      .getRepository(EventStoreEntity)
      .createQueryBuilder('e')
      .where('e.event_type = :eventType AND e.tenant_id = :tenantId', { eventType, tenantId })
      .orderBy('e.occurred_at', 'ASC')
      .limit(limit)
      .getMany();

    return rows.map(this.toStoredEvent);
  }

  private toStoredEvent(row: EventStoreEntity): StoredEvent {
    return {
      eventId: row.eventId,
      aggregateId: row.aggregateId,
      tenantId: row.tenantId,
      eventType: row.eventType,
      payload: row.payload as Record<string, unknown>,
      version: row.version,
      occurredAt: row.occurredAt,
      correlationId: row.correlationId ?? '',
      causationId: row.causationId,
      schemaVersion: row.schemaVersion,
    };
  }
}
