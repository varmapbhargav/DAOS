import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'asset_lifecycle_history', schema: 'asset_origination' })
export class AssetLifecycleHistoryOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'previous_status', type: 'text' })
  previousStatus!: string;

  @Column({ name: 'new_status', type: 'text' })
  newStatus!: string;

  @Column({ name: 'transition_reason', type: 'text', nullable: true })
  transitionReason!: string | null;

  @Column({ name: 'changed_by', type: 'text' })
  changedBy!: string;

  @Column({ name: 'changed_at', type: 'timestamptz' })
  changedAt!: Date;

  @Column({ name: 'metadata', type: 'jsonb', default: '{}' })
  metadata!: object;
}