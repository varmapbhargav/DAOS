import { Column, CreateDateColumn, Entity, Index, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'cash_flow_models', schema: 'asset_origination' })
export class CashFlowModelOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'term_periods', type: 'integer' })
  termPeriods!: number;

  @Column({ name: 'cash_flows', type: 'jsonb', default: '[]' })
  cashFlows!: Array<{
    period: number;
    amountMinorUnits: string;
    currency: string;
  }>;

  @Column({ name: 'discount_rate_percent', type: 'decimal', precision: 10, scale: 6 })
  discountRatePercent!: number;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
