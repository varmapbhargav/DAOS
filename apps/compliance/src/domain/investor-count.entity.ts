import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'investor_counts' })
export class InvestorCountEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'regulatory_framework', type: 'text' })
  regulatoryFramework!: string;

  @Column({ name: 'current_count', type: 'integer', default: 0 })
  currentCount!: number;

  @Column({ name: 'limit', type: 'integer' })
  limit!: number;

  @Column({ name: 'threshold_alert_pct', type: 'numeric', default: 80 })
  thresholdAlertPercentage!: number;

  @CreateDateColumn({ name: 'last_calculated_at', type: 'timestamptz', default: () => 'NOW()' })
  lastCalculatedAt!: Date;
}
