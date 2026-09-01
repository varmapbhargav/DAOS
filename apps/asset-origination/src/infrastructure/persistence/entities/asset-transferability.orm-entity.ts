import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_transferability' })
export class AssetTransferabilityOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'transferable', type: 'boolean', default: true })
  transferable!: boolean;

  @Column({ name: 'assignable', type: 'boolean', default: true })
  assignable!: boolean;

  @Column({ name: 'fractionalizable', type: 'boolean', default: false })
  fractionalizable!: boolean;

  @Column({ name: 'tokenizable', type: 'boolean', default: false })
  tokenizable!: boolean;

  @Column({ name: 'beneficial_interest_transferable', type: 'boolean', default: true })
  beneficialInterestTransferable!: boolean;

  @Column({ name: 'issuer_consent_required', type: 'boolean', default: false })
  issuerConsentRequired!: boolean;

  @Column({ name: 'owner_consent_required', type: 'boolean', default: false })
  ownerConsentRequired!: boolean;

  @Column({ name: 'regulator_approval_required', type: 'boolean', default: false })
  regulatorApprovalRequired!: boolean;

  @Column({ name: 'geographic_restrictions', type: 'jsonb', default: '[]' })
  geographicRestrictions!: string[];

  @Column({ name: 'investor_restrictions', type: 'jsonb', default: '[]' })
  investorRestrictions!: string[];

  @Column({ name: 'secondary_transfer_restrictions', type: 'jsonb', default: '[]' })
  secondaryTransferRestrictions!: string[];

  @Column({ name: 'lockup_days', type: 'integer', nullable: true })
  lockupDays!: number | null;

  @Column({ name: 'pre_emption_rights', type: 'boolean', default: false })
  preEmptionRights!: boolean;

  @Column({ name: 'transfer_fees', type: 'text', nullable: true })
  transferFees!: string | null;

  @Column({ name: 'transfer_documentation', type: 'text', nullable: true })
  transferDocumentation!: string | null;

  @Column({ name: 'legal_opinion_required', type: 'boolean', default: false })
  legalOpinionRequired!: boolean;

  @Column({ name: 'status', type: 'text', default: 'NOT_ASSESSED' })
  status!: string;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'reviewer', type: 'uuid', nullable: true })
  reviewer!: string | null;

  @Column({ name: 'assessment_date', type: 'timestamptz', nullable: true })
  assessmentDate!: string | null;

  @Column({ name: 'review_decision', type: 'text', nullable: true })
  reviewDecision!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
