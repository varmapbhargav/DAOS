import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'assets', schema: 'asset_origination' })
export class AssetOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'asset_class', type: 'text' })
  assetClass!: string;

  @Column({ name: 'sponsor_id', type: 'uuid' })
  sponsorId!: string;

  @Column({ name: 'sponsor_entity_id', type: 'uuid' })
  sponsorEntityId!: string;

  @Column({ name: 'status', type: 'text', default: 'originated' })
  status!: string;

  @Column({ name: 'jurisdictions', type: 'jsonb', default: '[]' })
  jurisdictions!: string[];

  @Column({ name: 'purchase_price_amount', type: 'bigint', nullable: true })
  purchasePriceAmount!: string | null;

  @Column({ name: 'purchase_price_currency', type: 'text', nullable: true })
  purchasePriceCurrency!: string | null;

  @Column({ name: 'collateral', type: 'jsonb', default: '[]' })
  collateral!: object;

  @Column({ name: 'provenance', type: 'jsonb', default: '[]' })
  provenance!: object;

  @Column({ name: 'valuation_fair_value', type: 'text', nullable: true })
  valuationFairValue!: string | null;

  @Column({ name: 'valuation_currency', type: 'text', nullable: true })
  valuationCurrency!: string | null;

  @Column({ name: 'valuation_methodology', type: 'text', nullable: true })
  valuationMethodology!: string | null;

  @Column({ name: 'valuation_valued_at', type: 'timestamptz', nullable: true })
  valuationValuedAt!: string | null;

  @Column({ name: 'due_diligence_rating', type: 'text', nullable: true })
  dueDiligenceRating!: string | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @Column({ name: 'sponsor_references_id', type: 'uuid', nullable: true })
  sponsorReferencesId!: string | null;

  @Column({ name: 'sponsor_references_entity_id', type: 'uuid', nullable: true })
  sponsorReferencesEntityId!: string | null;

  @Column({ name: 'sponsor_references_name', type: 'text', nullable: true })
  sponsorReferencesName!: string | null;

  @Column({ name: 'sponsor_references_jurisdiction', type: 'text', nullable: true })
  sponsorReferencesJurisdiction!: string | null;

  @Column({ name: 'sponsor_references_relationship_status', type: 'text', nullable: true })
  sponsorReferencesRelationshipStatus!: string | null;

  @Column({ name: 'sponsor_references_risk_rating', type: 'text', nullable: true })
  sponsorReferencesRiskRating!: string | null;

  @Column({ name: 'sponsor_references_verification_status', type: 'text', nullable: true })
  sponsorReferencesVerificationStatus!: string | null;
}
