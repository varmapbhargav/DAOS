import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'risk_assessments', schema: 'asset_origination' })
export class AssetRiskAssessmentOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'overall_score', type: 'integer' })
  overallScore!: number;

  @Column({ name: 'risk_level', type: 'text' })
  riskLevel!: string;

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