import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_counterparties' })
export class AssetCounterpartyOrmEntity {
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

  @Column({ name: 'counterparty_type', type: 'text' })
  counterpartyType!: string;

  @Column({ name: 'role', type: 'text' })
  role!: string;

  @Column({ name: 'legal_role', type: 'text', nullable: true })
  legalRole!: string | null;

  @Column({ name: 'economic_role', type: 'text', nullable: true })
  economicRole!: string | null;

  @Column({ name: 'ownership_percentage', type: 'numeric', nullable: true })
  ownershipPercentage!: number | null;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo!: string | null;

  @Column({ name: 'verification_status', type: 'text', default: 'UNVERIFIED' })
  verificationStatus!: string;

  @Column({ name: 'compliance_status', type: 'text', nullable: true })
  complianceStatus!: string | null;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
