import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_claims' })
export class AssetClaimOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'claim_statement', type: 'text' })
  claimStatement!: string;

  @Column({ name: 'claim_type', type: 'text' })
  claimType!: string;

  @Column({ name: 'claim_owner', type: 'uuid' })
  claimOwner!: string;

  @Column({ name: 'materiality', type: 'text' })
  materiality!: string;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'verification_method', type: 'text', nullable: true })
  verificationMethod!: string | null;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'confidence', type: 'integer', nullable: true })
  confidence!: number | null;

  @Column({ name: 'reviewer', type: 'uuid', nullable: true })
  reviewer!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
