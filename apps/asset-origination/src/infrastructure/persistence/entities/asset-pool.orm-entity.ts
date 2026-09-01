import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_pools', schema: 'asset_origination' })
export class AssetPoolOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'name', type: 'text', unique: true })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'pool_type', type: 'text' })
  poolType!: string;

  @Column({ name: 'strategy', type: 'text' })
  strategy!: string;

  @Column({ name: 'currency', type: 'char(3)' })
  currency!: string;

  @Column({ name: 'status', type: 'text', default: 'DRAFT' })
  status!: string;

  @Column({ name: 'concentration_rules', type: 'jsonb', default: '[]' })
  concentrationRules!: any[];

  @Column({ name: 'eligibility_policy', type: 'jsonb', default: '{}' })
  eligibilityPolicy!: any;

  @Column({ name: 'gross_value', type: 'numeric', default: 0 })
  grossValue!: number;

  @Column({ name: 'net_value', type: 'numeric', default: 0 })
  netValue!: number;

  @Column({ name: 'outstanding_value', type: 'numeric', default: 0 })
  outstandingValue!: number;

  @Column({ name: 'jurisdictions', type: 'jsonb', default: '[]' })
  jurisdictions!: string[];

  @Column({ name: 'weighted_avg_maturity', type: 'numeric', nullable: true })
  weightedAvgMaturity!: number | null;

  @Column({ name: 'weighted_avg_ltv', type: 'numeric', nullable: true })
  weightedAvgLtv!: number | null;

  @Column({ name: 'concentration', type: 'numeric', default: 0 })
  concentration!: number;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: string;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: string | null;

  @Column({ name: 'parent_pool_id', type: 'uuid', nullable: true })
  parentPoolId!: string | null;

  @Column({ name: 'child_pool_ids', type: 'jsonb', default: '[]' })
  childPoolIds!: string[];
}