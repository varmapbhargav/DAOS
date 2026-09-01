import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'scenario_models' })
export class ScenarioModelOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'opportunity_id', type: 'uuid' })
  opportunityId!: string;

  @Column({ name: 'strategy_id', type: 'uuid', nullable: true })
  strategyId!: string | null;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'scenario_type', type: 'text' })
  scenarioType!: string;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @Column({ name: 'assumptions', type: 'jsonb', nullable: true })
  assumptions!: object | null;

  @Column({ name: 'financial_model', type: 'jsonb', nullable: true })
  financialModel!: object | null;

  @Column({ name: 'hold_period_months', type: 'integer', default: 60 })
  holdPeriodMonths!: number;

  @Column({ name: 'is_selected', type: 'boolean', default: false })
  isSelected!: boolean;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'versions', type: 'jsonb', default: '[]' })
  versions!: object[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}