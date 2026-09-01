import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'outbox_events' })
export class OutboxEventOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId!: string;

  @Column({ name: 'aggregate_type', type: 'text' })
  aggregateType!: string;

  @Column({ name: 'event_type', type: 'text' })
  eventType!: string;

  @Column({ name: 'event_version', type: 'integer', default: 1 })
  eventVersion!: number;

  @Column({ name: 'payload', type: 'jsonb' })
  payload!: object;

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId!: string | null;

  @Column({ name: 'causation_id', type: 'uuid', nullable: true })
  causationId!: string | null;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' })
  occurredAt!: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount!: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;
}