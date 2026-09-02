import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'investment_theses' })
export class InvestmentThesisOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'opportunity_id', type: 'uuid' })
  opportunityId!: string;

  @Column({ name: 'thesis_statement', type: 'text' })
  thesisStatement!: string;

  @Column({ name: 'executive_summary', type: 'text' })
  executiveSummary!: string;

  @Column({ name: 'investment_rationale', type: 'text' })
  investmentRationale!: string;

  @Column({ name: 'market_opportunity', type: 'text' })
  marketOpportunity!: string;

  @Column({ name: 'asset_rationale', type: 'text' })
  assetRationale!: string;

  @Column({ name: 'problem', type: 'text' })
  problem!: string;

  @Column({ name: 'solution', type: 'text' })
  solution!: string;

  @Column({ name: 'competitive_advantage', type: 'text' })
  competitiveAdvantage!: string;

  @Column({ name: 'value_creation_thesis', type: 'text' })
  valueCreationThesis!: string;

  @Column({ name: 'key_catalysts', type: 'jsonb', default: '[]' })
  keyCatalysts!: string[];

  @Column({ name: 'key_risks', type: 'jsonb', default: '[]' })
  keyRisks!: string[];

  @Column({ name: 'risk_mitigation', type: 'jsonb', default: '[]' })
  riskMitigation!: string[];

  @Column({ name: 'investment_horizon_months', type: 'integer' })
  investmentHorizonMonths!: number;

  @Column({ name: 'entry_thesis', type: 'text' })
  entryThesis!: string;

  @Column({ name: 'exit_strategy', type: 'jsonb' })
  exitStrategy!: object;

  @Column({ name: 'expected_return', type: 'jsonb' })
  expectedReturn!: object;

  @Column({ name: 'target_yield', type: 'jsonb' })
  targetYield!: object;

  @Column({ name: 'confidence_score', type: 'jsonb' })
  confidenceScore!: object;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'versions', type: 'jsonb', default: '[]' })
  versions!: object[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}