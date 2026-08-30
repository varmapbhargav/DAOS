import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'share_classes', schema: 'product_design_studio' })
export class ShareClassOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'currency', type: 'text' })
  currency!: string;

  @Column({ name: 'target_size_amount', type: 'bigint' })
  targetSizeAmount!: string;

  @Column({ name: 'target_size_currency', type: 'text' })
  targetSizeCurrency!: string;

  @Column({ name: 'min_investment_amount', type: 'bigint' })
  minInvestmentAmount!: string;

  @Column({ name: 'min_investment_currency', type: 'text' })
  minInvestmentCurrency!: string;

  @Column({ name: 'max_investors', type: 'integer' })
  maxInvestors!: number;

  @Column({ name: 'price_per_share_amount', type: 'bigint', nullable: true })
  pricePerShareAmount!: string | null;

  @Column({ name: 'price_per_share_currency', type: 'text', nullable: true })
  pricePerShareCurrency!: string | null;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
