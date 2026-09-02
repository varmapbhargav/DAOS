import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'dd_cases', schema: 'asset_origination' })
export class DueDiligenceCaseOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'status', type: 'text', default: 'IN_PROGRESS' })
  status!: string;

  @Column({ name: 'checklist', type: 'jsonb', default: '[]' })
  checklist!: string[];

  @Column({ name: 'reviewers', type: 'jsonb', default: '[]' })
  reviewers!: string[];

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: string | null;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}