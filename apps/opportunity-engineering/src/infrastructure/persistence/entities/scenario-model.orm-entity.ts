import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'scenario_models', schema: 'opportunity_engineering' })
export class ScenarioModelOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'opportunity_id', type: 'uuid' })
  opportunityId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'scenario_type', type: 'text' })
  scenarioType!: string;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @Column({ name: 'key_assumptions', type: 'jsonb', default: '{}' })
  keyAssumptions!: object;

  @Column({ name: 'projected_irr_percent', type: 'double precision', nullable: true })
  projectedIrrPercent!: number | null;

  @Column({ name: 'projected_multiple', type: 'double precision', nullable: true })
  projectedMultiple!: number | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
