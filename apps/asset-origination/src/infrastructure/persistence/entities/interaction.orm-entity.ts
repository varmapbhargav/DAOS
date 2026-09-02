import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'interactions', schema: 'asset_origination' })
export class InteractionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string | null;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid', nullable: true })
  assetId!: string | null;

  @Index()
  @Column({ name: 'counterparty_id', type: 'uuid', nullable: true })
  counterpartyId!: string | null;

  @Column({ name: 'type', type: 'text' })
  type!: string;

  @Column({ name: 'direction', type: 'text' })
  direction!: string;

  @Column({ name: 'subject', type: 'text' })
  subject!: string;

  @Column({ name: 'body', type: 'text', nullable: true })
  body!: string | null;

  @Column({ name: 'participants', type: 'jsonb', default: '[]' })
  participants!: string[];

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: string;

  @Column({ name: 'recorded_by', type: 'uuid' })
  recordedBy!: string;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt!: string;

  @Column({ name: 'metadata', type: 'jsonb', default: '{}' })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}