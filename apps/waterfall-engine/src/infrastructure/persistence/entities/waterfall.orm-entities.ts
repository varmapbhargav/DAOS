import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'waterfall_models' })
export class WaterfallModelOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'waterfall_type', type: 'text' })
  waterfallType!: string;

  @Index()
  @Column({ name: 'product_id', type: 'text' })
  productId!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ type: 'jsonb' })
  tiers!: object;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'distributions' })
export class DistributionOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'product_id', type: 'text' })
  productId!: string;

  @Column({ name: 'distribution_type', type: 'text' })
  distributionType!: string;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ name: 'total_amount', type: 'text', default: '0' })
  totalAmount!: string;

  @Column({ name: 'record_date', type: 'text' })
  recordDate!: string;

  @Column({ name: 'payment_date', type: 'text' })
  paymentDate!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'investor_distributions', type: 'jsonb', default: () => "'[]'" })
  investorDistributions!: object;

  @Column({ type: 'text', default: '0' })
  promote!: string;

  @Column({ name: 'carried_interest', type: 'text', default: '0' })
  carriedInterest!: string;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'corporate_actions' })
export class CorporateActionOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'issuance_id', type: 'text' })
  issuanceId!: string;

  @Column({ type: 'text' })
  type!: string;

  @Column({ name: 'ex_date', type: 'text' })
  exDate!: string;

  @Column({ name: 'record_date', type: 'text' })
  recordDate!: string;

  @Column({ name: 'payment_date', type: 'text' })
  paymentDate!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  options!: object;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  elections!: object;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
