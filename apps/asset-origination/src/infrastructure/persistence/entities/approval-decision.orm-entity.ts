import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'approval_decisions', schema: 'asset_origination' })
export class ApprovalDecisionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Index()
  @Column({ name: 'approval_case_id', type: 'uuid' })
  approvalCaseId!: string;

  @Column({ name: 'approver', type: 'uuid' })
  approver!: string;

  @Column({ name: 'level', type: 'text' })
  level!: string;

  @Column({ name: 'decision', type: 'text' })
  decision!: string;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason!: string | null;

  @Column({ name: 'conditions', type: 'jsonb', default: '[]' })
  conditions!: string[];

  @Column({ name: 'decided_at', type: 'timestamptz' })
  decidedAt!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}