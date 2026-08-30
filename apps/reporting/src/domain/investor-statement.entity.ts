import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'investor_statements', schema: 'reporting' })
export class InvestorStatementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'investor_id', type: 'uuid' })
  investorId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd!: Date;

  @Column({ name: 'frequency', type: 'text' })
  frequency!: string;

  @Column({ name: 'opening_nav', type: 'numeric' })
  openingNav!: number;

  @Column({ name: 'closing_nav', type: 'numeric' })
  closingNav!: number;

  @Column({ name: 'contributions', type: 'numeric' })
  contributions!: number;

  @Column({ name: 'distributions', type: 'numeric' })
  distributions!: number;

  @Column({ name: 'unrealized_gain', type: 'numeric' })
  unrealizedGain!: number;

  @Column({ name: 'realized_gain', type: 'numeric' })
  realizedGain!: number;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @CreateDateColumn({ name: 'distributed_at', type: 'timestamptz', nullable: true })
  distributedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
