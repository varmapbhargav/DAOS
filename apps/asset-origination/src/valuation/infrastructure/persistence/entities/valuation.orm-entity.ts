import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'valuations', schema: 'asset_origination' })
export class ValuationOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'status', type: 'text', default: 'REQUESTED' })
  status!: string;

  @Column({ name: 'current_market_value', type: 'numeric', nullable: true })
  currentMarketValue!: number | null;

  @Column({ name: 'fair_value', type: 'numeric', nullable: true })
  fairValue!: number | null;

  @Column({ name: 'book_value', type: 'numeric', nullable: true })
  bookValue!: number | null;

  @Column({ name: 'nav', type: 'numeric', nullable: true })
  nav!: number | null;

  @Column({ name: 'face_value', type: 'numeric', nullable: true })
  faceValue!: number | null;

  @Column({ name: 'outstanding_principal', type: 'numeric', nullable: true })
  outstandingPrincipal!: number | null;

  @Column({ name: 'indicative_acquisition_value', type: 'numeric', nullable: true })
  indicativeAcquisitionValue!: number | null;

  @Column({ name: 'purchase_price', type: 'numeric', nullable: true })
  purchasePrice!: number | null;

  @Column({ name: 'valuation_date', type: 'timestamptz', nullable: true })
  valuationDate!: string | null;

  @Column({ name: 'valuation_source', type: 'text', nullable: true })
  valuationSource!: string | null;

  @Column({ name: 'valuer', type: 'uuid', nullable: true })
  valuer!: string | null;

  @Column({ name: 'methodology', type: 'text', nullable: true })
  methodology!: string | null;

  @Column({ name: 'confidence', type: 'integer', nullable: true })
  confidence!: number | null;

  @Column({ name: 'currency', type: 'char', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'reviewer', type: 'uuid', nullable: true })
  reviewer!: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: string | null;

  @Column({ name: 'approval_reason', type: 'text', nullable: true })
  approvalReason!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'requested_at', type: 'timestamptz' })
  requestedAt!: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt!: string | null;

  @Column({ name: 'uploaded_at', type: 'timestamptz', nullable: true })
  uploadedAt!: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: string | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}