import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'investment_products' })
export class InvestmentProductOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'product_type', type: 'text' })
  productType!: string;

  @Column({ name: 'strategy', type: 'jsonb' })
  strategy!: object;

  @Column({ name: 'benchmark', type: 'jsonb', nullable: true })
  benchmark!: object | null;

  @Column({ name: 'liquidity_terms', type: 'jsonb' })
  liquidityTerms!: object;

  @Column({ name: 'fee_structure', type: 'jsonb' })
  feeStructure!: object;

  @Column({ name: 'status', type: 'text', default: 'design' })
  status!: string;

  @Column({ name: 'share_class_ids', type: 'jsonb', default: '[]' })
  shareClassIds!: string[];

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
}
