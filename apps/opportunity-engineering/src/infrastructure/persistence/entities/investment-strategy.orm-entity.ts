import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'investment_strategies' })
export class InvestmentStrategyOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'opportunity_id', type: 'uuid' })
  opportunityId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'strategy_type', type: 'text' })
  strategyType!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @Column({ name: 'entry', type: 'jsonb' })
  entry!: object;

  @Column({ name: 'operating', type: 'jsonb' })
  operating!: object;

  @Column({ name: 'financing', type: 'jsonb' })
  financing!: object;

  @Column({ name: 'value_creation', type: 'jsonb' })
  valueCreation!: object;

  @Column({ name: 'exit', type: 'jsonb' })
  exit!: object;

  @Column({ name: 'investment_horizon_months', type: 'integer' })
  investmentHorizonMonths!: number;

  @Column({ name: 'constraints', type: 'jsonb', default: '[]' })
  constraints!: object;

  @Column({ name: 'target_returns', type: 'jsonb' })
  targetReturns!: object;

  @Column({ name: 'risk_tolerance', type: 'jsonb' })
  riskTolerance!: object;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'versions', type: 'jsonb', default: '[]' })
  versions!: object[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}