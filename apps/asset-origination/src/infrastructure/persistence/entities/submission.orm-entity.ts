import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'submissions' })
export class SubmissionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'source', type: 'text' })
  source!: string;

  @Column({ name: 'channel', type: 'text' })
  channel!: string;

  @Column({ name: 'payload', type: 'jsonb', default: '{}' })
  payload!: Record<string, unknown>;

  @Column({ name: 'documents', type: 'jsonb', default: '[]' })
  documents!: object;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'acknowledged_at', type: 'timestamptz', nullable: true })
  acknowledgedAt!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'received_at', type: 'timestamptz' })
  receivedAt!: string;

  @Column({ name: 'submitted_by', type: 'uuid' })
  submittedBy!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
