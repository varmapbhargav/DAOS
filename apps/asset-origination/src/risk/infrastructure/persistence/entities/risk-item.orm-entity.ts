import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'risk_items', schema: 'asset_origination' })
export class RiskItemOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'category', type: 'text' })
  category!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'probability', type: 'text' })
  probability!: string;

  @Column({ name: 'impact', type: 'text' })
  impact!: string;

  @Column({ name: 'score', type: 'integer' })
  score!: number;

  @Column({ name: 'mitigation', type: 'text', nullable: true })
  mitigation!: string | null;

  @Column({ name: 'owner', type: 'uuid', nullable: true })
  owner!: string | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'evidence', type: 'jsonb', default: '[]' })
  evidence!: string[];

  @Column({ name: 'status', type: 'text', default: 'OPEN' })
  status!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}