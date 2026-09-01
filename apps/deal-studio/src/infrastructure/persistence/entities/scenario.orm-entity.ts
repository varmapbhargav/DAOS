import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'scenarios' })
export class ScenarioOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Column({ name: 'scenario_type', type: 'text' })
  type!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'assumptions', type: 'jsonb' })
  assumptions!: object;

  @Column({ name: 'cash_flow_periods', type: 'jsonb', default: '[]' })
  cashFlowPeriods!: object;

  @Column({ name: 'result', type: 'jsonb', nullable: true })
  result!: object | null;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
