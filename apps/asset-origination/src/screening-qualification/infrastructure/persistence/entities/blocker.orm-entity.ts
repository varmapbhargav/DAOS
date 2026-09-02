import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'blockers' })
export class BlockerOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'severity', type: 'text' })
  severity!: string;

  @Column({ name: 'category', type: 'text' })
  category!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'owner', type: 'uuid', nullable: true })
  owner!: string | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'resolution_action', type: 'text', nullable: true })
  resolutionAction!: string | null;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'resolution_status', type: 'text', default: 'OPEN' })
  resolutionStatus!: string;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy!: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: string | null;

  @Column({ name: 'resolved_reason', type: 'text', nullable: true })
  resolvedReason!: string | null;

  @Column({ name: 'raised_at', type: 'timestamptz' })
  raisedAt!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}