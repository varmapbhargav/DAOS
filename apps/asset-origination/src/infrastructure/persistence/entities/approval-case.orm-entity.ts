import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'approval_cases', schema: 'asset_origination' })
export class ApprovalCaseOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'status', type: 'text', default: 'PENDING' })
  status!: string;

  @Column({ name: 'approval_type', type: 'text', default: 'SINGLE' })
  approvalType!: string;

  @Column({ name: 'levels', type: 'jsonb', default: '[]' })
  levels!: string[];

  @Column({ name: 'current_level', type: 'integer', default: 0 })
  currentLevel!: number;

  @Column({ name: 'threshold_amount', type: 'numeric', nullable: true })
  thresholdAmount!: number | null;

  @Column({ name: 'required_approvers', type: 'jsonb', default: '{}' })
  requiredApprovers!: Record<string, string[]>;

  @Column({ name: 'decisions', type: 'jsonb', default: '[]' })
  decisions!: string[];

  @Column({ name: 'conditions', type: 'jsonb', default: '[]' })
  conditions!: string[];

  @Column({ name: 'conflict_of_interest_checked', type: 'boolean', default: false })
  conflictOfInterestChecked!: boolean;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: string | null;

  @Column({ name: 'final_decided_by', type: 'uuid', nullable: true })
  finalDecidedBy!: string | null;

  @Column({ name: 'final_reason', type: 'text', nullable: true })
  finalReason!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}