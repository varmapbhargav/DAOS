import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'opportunities', schema: 'opportunity_engineering' })
export class OpportunityOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'sponsor_id', type: 'uuid' })
  sponsorId!: string;

  @Column({ name: 'status', type: 'text', default: 'engineered' })
  status!: string;

  @Column({ name: 'target_return', type: 'jsonb', nullable: true })
  targetReturn!: object | null;

  @Column({ name: 'score', type: 'jsonb', nullable: true })
  score!: object | null;

  @Column({ name: 'sensitivity_factors', type: 'jsonb', default: '[]' })
  sensitivityFactors!: object;

  @Column({ name: 'scenario_model_ids', type: 'jsonb', default: '[]' })
  scenarioModelIds!: string[];

  @Column({ name: 'approved_scenario_id', type: 'uuid', nullable: true })
  approvedScenarioId!: string | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
