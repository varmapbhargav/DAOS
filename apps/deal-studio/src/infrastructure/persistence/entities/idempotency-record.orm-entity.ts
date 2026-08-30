import { Column, Entity } from 'typeorm';

@Entity({ name: 'idempotency_records', schema: 'deal_studio' })
export class IdempotencyRecordOrmEntity {
  @Column('text', { primary: true, name: 'key' })
  key!: string;

  @Column({ name: 'request_hash', type: 'text' })
  requestHash!: string;

  @Column({ name: 'status', type: 'text', default: 'IN_FLIGHT' })
  status!: string;

  @Column({ name: 'response_reference', type: 'text', nullable: true })
  responseReference!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: string | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;
}
