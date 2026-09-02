import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_provenance' })
export class AssetProvenanceOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'event_type', type: 'text' })
  eventType!: string;

  @Column({ name: 'from_entity_id', type: 'uuid', nullable: true })
  fromEntityId!: string | null;

  @Column({ name: 'to_entity_id', type: 'uuid', nullable: true })
  toEntityId!: string | null;

  @Column({ name: 'effective_date', type: 'timestamptz' })
  effectiveDate!: string;

  @Column({ name: 'recorded_date', type: 'timestamptz' })
  recordedDate!: string;

  @Column({ name: 'jurisdiction', type: 'text', nullable: true })
  jurisdiction!: string | null;

  @Column({ name: 'registry_reference', type: 'text', nullable: true })
  registryReference!: string | null;

  @Column({ name: 'document_reference', type: 'text', nullable: true })
  documentReference!: string | null;

  @Column({ name: 'transaction_reference', type: 'text', nullable: true })
  transactionReference!: string | null;

  @Column({ name: 'verification_status', type: 'text', default: 'UNVERIFIED' })
  verificationStatus!: string;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'hash', type: 'text', nullable: true })
  hash!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
