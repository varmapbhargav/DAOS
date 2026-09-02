import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'dd_findings', schema: 'asset_origination' })
export class DdFindingOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'dd_case_id', type: 'uuid' })
  ddCaseId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'category', type: 'text' })
  category!: string;

  @Column({ name: 'severity', type: 'text' })
  severity!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'evidence', type: 'jsonb', default: '[]' })
  evidence!: string[];

  @Column({ name: 'impact', type: 'text', nullable: true })
  impact!: string | null;

  @Column({ name: 'recommendation', type: 'text', nullable: true })
  recommendation!: string | null;

  @Column({ name: 'remediation', type: 'text', nullable: true })
  remediation!: string | null;

  @Column({ name: 'owner', type: 'uuid', nullable: true })
  owner!: string | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'status', type: 'text', default: 'OPEN' })
  status!: string;

  @Column({ name: 'reviewer', type: 'uuid', nullable: true })
  reviewer!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}