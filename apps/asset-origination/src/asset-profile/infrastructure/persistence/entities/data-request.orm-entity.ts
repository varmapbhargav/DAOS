import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'data_requests' })
export class DataRequestOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'requested_from', type: 'text' })
  requestedFrom!: string;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy!: string;

  @Column({ name: 'request_type', type: 'text' })
  requestType!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'priority', type: 'text', default: 'MEDIUM' })
  priority!: string;

  @Column({ name: 'required_by', type: 'timestamptz', nullable: true })
  requiredBy!: string | null;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'response', type: 'text', nullable: true })
  response!: string | null;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
