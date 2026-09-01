import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'event_store' })
export class EventStoreEntity {
  @PrimaryColumn('uuid', { name: 'event_id' })
  eventId!: string;

  @Index()
  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'event_type', type: 'text' })
  eventType!: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload!: object;

  @Index()
  @Column({ name: 'version', type: 'integer' })
  version!: number;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: string;

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId!: string | null;

  @Column({ name: 'causation_id', type: 'uuid', nullable: true })
  causationId!: string | null;

  @Column({ name: 'schema_version', type: 'integer', default: 1 })
  schemaVersion!: number;
}
