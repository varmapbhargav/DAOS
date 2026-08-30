import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'performance_metrics', schema: 'reporting' })
export class PerformanceMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'as_of_date', type: 'timestamptz' })
  asOfDate!: Date;

  @Column({ name: 'irr', type: 'numeric' })
  irr!: number;

  @Column({ name: 'moic', type: 'numeric' })
  moic!: number;

  @Column({ name: 'dpi', type: 'numeric' })
  dpi!: number;

  @Column({ name: 'tvpi', type: 'numeric' })
  tvpi!: number;

  @Column({ name: 'rvpi', type: 'numeric' })
  rvpi!: number;

  @Column({ name: 'alpha', type: 'numeric', nullable: true })
  alpha?: number;

  @Column({ name: 'beta', type: 'numeric', nullable: true })
  beta?: number;

  @Column({ name: 'sharpe_ratio', type: 'numeric', nullable: true })
  sharpeRatio?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
