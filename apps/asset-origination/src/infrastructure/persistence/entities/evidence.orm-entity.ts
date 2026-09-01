import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'evidence' })
export class EvidenceOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid', nullable: true })
  assetId!: string | null;

  @Index()
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string | null;

  @Column({ name: 'evidence_type', type: 'text' })
  evidenceType!: string;

  @Column({ name: 'source', type: 'text' })
  source!: string;

  @Column({ name: 'source_reference', type: 'text', nullable: true })
  sourceReference!: string | null;

  @Column({ name: 'evidence_date', type: 'timestamptz', nullable: true })
  evidenceDate!: string | null;

  @Column({ name: 'collected_at', type: 'timestamptz' })
  collectedAt!: string;

  @Column({ name: 'collected_by', type: 'uuid' })
  collectedBy!: string;

  @Column({ name: 'confidence', type: 'integer', nullable: true })
  confidence!: number | null;

  @Column({ name: 'verification_status', type: 'text', default: 'UNVERIFIED' })
  verificationStatus!: string;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string | null;

  @Column({ name: 'external_reference', type: 'text', nullable: true })
  externalReference!: string | null;

  @Column({ name: 'hash', type: 'text', nullable: true })
  hash!: string | null;

  @Column({ name: 'signature', type: 'text', nullable: true })
  signature!: string | null;

  @Column({ name: 'expiry', type: 'timestamptz', nullable: true })
  expiry!: string | null;

  @Column({ name: 'access_policy', type: 'text', nullable: true })
  accessPolicy!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
