import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'term_sheets', schema: 'deal_studio' })
export class TermSheetOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Column({ name: 'status', type: 'text', default: 'DRAFT' })
  status!: string;

  @Column({ name: 'current_version_number', type: 'integer', default: 1 })
  currentVersionNumber!: number;

  @Column({ name: 'versions', type: 'jsonb', default: '[]' })
  versions!: object;

  @Column({ name: 'economic_rights', type: 'jsonb', nullable: true })
  economicRights!: object | null;

  @Column({ name: 'governance_terms', type: 'jsonb', nullable: true })
  governanceTerms!: object | null;

  @Column({ name: 'vesting_schedule', type: 'jsonb', nullable: true })
  vestingSchedule!: object | null;

  @Column({ name: 'transfer_restrictions', type: 'jsonb', default: '[]' })
  transferRestrictions!: object;

  @Column({ name: 'closing_condition_ids', type: 'jsonb', default: '[]' })
  closingConditionIds!: object;

  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt!: string | null;

  @Column({ name: 'finalized_by', type: 'uuid', nullable: true })
  finalizedBy!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
