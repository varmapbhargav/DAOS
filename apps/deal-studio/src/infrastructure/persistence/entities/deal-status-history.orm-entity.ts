import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'deal_status_history', schema: 'deal_studio' })
export class DealStatusHistoryOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'previous_status', type: 'text', nullable: true })
  previousStatus!: string | null;

  @Column({ name: 'new_status', type: 'text' })
  newStatus!: string;

  @Column({ name: 'reason', type: 'text' })
  reason!: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy!: string;

  @Column({ name: 'changed_at', type: 'timestamptz' })
  changedAt!: string;

  @Column({ name: 'metadata', type: 'jsonb', default: '{}' })
  metadata!: object;
}
