import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_encumbrances' })
export class AssetEncumbranceOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'type', type: 'text' })
  type!: string;

  @Column({ name: 'holder_entity_id', type: 'uuid', nullable: true })
  holderEntityId!: string | null;

  @Column({ name: 'amount_minor_units', type: 'text', nullable: true })
  amountMinorUnits!: string | null;

  @Column({ name: 'currency', type: 'text', nullable: true })
  currency!: string | null;

  @Column({ name: 'priority', type: 'integer', nullable: true })
  priority!: number | null;

  @Column({ name: 'registration_number', type: 'text', nullable: true })
  registrationNumber!: string | null;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo!: string | null;

  @Column({ name: 'status', type: 'text', default: 'ACTIVE' })
  status!: string;

  @Column({ name: 'release_conditions', type: 'text', nullable: true })
  releaseConditions!: string | null;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'verification_status', type: 'text', default: 'UNVERIFIED' })
  verificationStatus!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
