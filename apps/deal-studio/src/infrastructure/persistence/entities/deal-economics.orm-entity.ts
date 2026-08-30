import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'deal_economics', schema: 'deal_studio' })
export class DealEconomicsOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'data', type: 'jsonb', default: '{}' })
  data!: object;

  @Column({ name: 'cash_flow_frequency', type: 'text', default: 'QUARTERLY' })
  cashFlowFrequency!: string;

  @Column({ name: 'cash_flow_periods', type: 'jsonb', default: '[]' })
  cashFlowPeriods!: object;

  @Column({ name: 'immutable', type: 'boolean', default: false })
  immutable!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
