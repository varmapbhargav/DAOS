import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'prices', schema: 'pricing_valuation' })
export class PriceOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'text' })
  isin!: string;

  @Column({ type: 'jsonb' })
  price!: object;

  @Column({ type: 'text' })
  source!: string;

  @Column({ name: 'fair_value_hierarchy', type: 'text' })
  fairValueHierarchy!: string;

  @Column({ name: 'last_updated_at', type: 'text' })
  lastUpdatedAt!: string;

  @Column({ name: 'is_stale', type: 'boolean', default: false })
  isStale!: boolean;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'price_history', schema: 'pricing_valuation' })
export class PriceHistoryOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'instrument_id', type: 'uuid' })
  instrumentId!: string;

  @Index()
  @Column({ type: 'text' })
  isin!: string;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ type: 'text', default: '0' })
  price!: string;

  @Column({ name: 'as_of', type: 'text' })
  asOf!: string;
}

@Entity({ name: 'valuation_models', schema: 'pricing_valuation' })
export class ValuationModelOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'text' })
  assetId!: string;

  @Column({ type: 'text' })
  methodology!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  value!: object | null;

  @Column({ name: 'report_id', type: 'text', nullable: true })
  reportId!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'discrepancy_detected', type: 'boolean', default: false })
  discrepancyDetected!: boolean;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
