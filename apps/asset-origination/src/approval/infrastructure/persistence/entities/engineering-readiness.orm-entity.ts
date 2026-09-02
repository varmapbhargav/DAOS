import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'engineering_readiness_assessments', schema: 'asset_origination' })
export class EngineeringReadinessOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'status', type: 'text', default: 'NOT_READY' })
  status!: string;

  @Column({ name: 'checks', type: 'jsonb', default: '{}' })
  checks!: Record<string, { passed: boolean; notes: string | null }>;

  @Column({ name: 'assessed_by', type: 'uuid' })
  assessedBy!: string;

  @Column({ name: 'assessed_at', type: 'timestamptz' })
  assessedAt!: string;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}