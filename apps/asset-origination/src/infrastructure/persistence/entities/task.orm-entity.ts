import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tasks', schema: 'asset_origination' })
export class TaskOrmEntity {
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

  @Column({ name: 'type', type: 'text' })
  type!: string;

  @Column({ name: 'title', type: 'text' })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'priority', type: 'text', default: 'MEDIUM' })
  priority!: string;

  @Column({ name: 'status', type: 'text', default: 'PENDING' })
  status!: string;

  @Index()
  @Column({ name: 'owner', type: 'uuid', nullable: true })
  owner!: string | null;

  @Index()
  @Column({ name: 'assignee', type: 'uuid', nullable: true })
  assignee!: string | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'sla_hours', type: 'integer', nullable: true })
  slaHours!: number | null;

  @Column({ name: 'dependencies', type: 'jsonb', default: '[]' })
  dependencies!: any[];

  @Column({ name: 'evidence', type: 'jsonb', default: '[]' })
  evidence!: string[];

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: string | null;

  @Column({ name: 'escalated', type: 'boolean', default: false })
  escalated!: boolean;

  @Column({ name: 'escalated_to', type: 'uuid', nullable: true })
  escalatedTo!: string | null;

  @Column({ name: 'escalated_at', type: 'timestamptz', nullable: true })
  escalatedAt!: string | null;

  @Column({ name: 'escalation_reason', type: 'text', nullable: true })
  escalationReason!: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: string;
}