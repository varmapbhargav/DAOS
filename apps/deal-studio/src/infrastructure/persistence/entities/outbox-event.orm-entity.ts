import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'outbox_events', schema: 'deal_studio' })
export class OutboxEventOrmEntity {
  @Column('uuid', { primary: true, name: 'event_id' })
  eventId!: string;

  @Column({ name: 'event_type', type: 'text' })
  eventType!: string;

  @Index()
  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: string;

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId!: string | null;

  @Column({ name: 'causation_id', type: 'uuid', nullable: true })
  causationId!: string | null;

  @Column({ name: 'payload', type: 'jsonb' })
  payload!: object;

  @Index()
  @Column({ name: 'status', type: 'text', default: 'PENDING' })
  status!: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount!: number;

  @Column({ name: 'last_error_at', type: 'timestamptz', nullable: true })
  lastErrorAt!: string | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: string | null;
}
