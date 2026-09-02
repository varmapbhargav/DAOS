import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'origination_cases' })
export class OriginationCaseOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_number', type: 'text' })
  caseNumber!: string;

  @Column({ name: 'case_name', type: 'text' })
  caseName!: string;

  @Column({ name: 'submission_type', type: 'text' })
  submissionType!: string;

  @Column({ name: 'submission_channel', type: 'text' })
  submissionChannel!: string;

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId!: string;

  @Column({ name: 'submitted_by', type: 'uuid' })
  submittedBy!: string;

  @Column({ name: 'relationship_manager_id', type: 'uuid', nullable: true })
  relationshipManagerId!: string | null;

  @Column({ name: 'assigned_team_id', type: 'uuid', nullable: true })
  assignedTeamId!: string | null;

  @Column({ name: 'assigned_analyst_id', type: 'uuid', nullable: true })
  assignedAnalystId!: string | null;

  @Column({ name: 'asset_class', type: 'text' })
  assetClass!: string;

  @Column({ name: 'asset_subclass', type: 'text', nullable: true })
  assetSubclass!: string | null;

  @Column({ name: 'jurisdictions', type: 'jsonb', default: '[]' })
  jurisdictions!: string[];

  @Column({ name: 'indicative_value_minor_units', type: 'text', nullable: true })
  indicativeValueMinorUnits!: string | null;

  @Column({ name: 'currency', type: 'text', nullable: true })
  currency!: string | null;

  @Column({ name: 'priority', type: 'text', default: 'MEDIUM' })
  priority!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'next_action', type: 'text', nullable: true })
  nextAction!: string | null;

  @Column({ name: 'next_action_due', type: 'timestamptz', nullable: true })
  nextActionDue!: string | null;

  @Column({ name: 'duplicate_check_status', type: 'text', default: 'NOT_RUN' })
  duplicateCheckStatus!: string;

  @Column({ name: 'initial_screening_status', type: 'text', default: 'NOT_RUN' })
  initialScreeningStatus!: string;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: string | null;

  @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
  receivedAt!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
