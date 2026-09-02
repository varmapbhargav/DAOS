import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_ownership' })
export class OwnershipOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({ name: 'person_id', type: 'uuid', nullable: true })
  personId!: string | null;

  @Column({ name: 'ownership_type', type: 'text' })
  ownershipType!: string;

  @Column({ name: 'ownership_percentage', type: 'numeric', nullable: true })
  ownershipPercentage!: number | null;

  @Column({ name: 'economic_interest_percentage', type: 'numeric', nullable: true })
  economicInterestPercentage!: number | null;

  @Column({ name: 'control_percentage', type: 'numeric', nullable: true })
  controlPercentage!: number | null;

  @Column({ name: 'acquisition_date', type: 'timestamptz', nullable: true })
  acquisitionDate!: string | null;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo!: string | null;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'verification_status', type: 'text', default: 'UNVERIFIED' })
  verificationStatus!: string;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
