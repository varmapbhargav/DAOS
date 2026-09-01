import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'deals' })
export class DealOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'sponsor_id', type: 'uuid' })
  sponsorId!: string;

  @Index()
  @Column({ name: 'status', type: 'text', default: 'DRAFT' })
  status!: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: object | null;

  @Column({ name: 'capital_stack', type: 'jsonb', nullable: true })
  capitalStack!: object | null;

  @Column({ name: 'economic_rights', type: 'jsonb', nullable: true })
  economicRights!: object | null;

  @Column({ name: 'governance_terms', type: 'jsonb', nullable: true })
  governanceTerms!: object | null;

  @Column({ name: 'closing_conditions', type: 'jsonb', default: '[]' })
  closingConditions!: object;

  @Column({ name: 'economics', type: 'jsonb', nullable: true })
  economics!: object | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: string | null;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejectedBy!: string | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: string | null;

  @Column({ name: 'hold_reason', type: 'text', nullable: true })
  holdReason!: string | null;

  @Column({ name: 'previous_status_before_hold', type: 'text', nullable: true })
  previousStatusBeforeHold!: string | null;

  @Column({ name: 'idempotency_key', type: 'text', nullable: true })
  idempotencyKey!: string | null;

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId!: string | null;

  @Column({ name: 'asset_references', type: 'jsonb', default: '[]' })
  assetReferences!: object;

  @Column({ name: 'entity_references', type: 'jsonb', default: '[]' })
  entityReferences!: object;

  @Column({ name: 'opportunity_reference', type: 'jsonb', nullable: true })
  opportunityReference!: object | null;

  @Column({ name: 'documents', type: 'jsonb', default: '[]' })
  documents!: object;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
