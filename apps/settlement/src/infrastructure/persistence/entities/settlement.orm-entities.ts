import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'settlement_instructions', schema: 'settlement' })
export class SettlementInstructionOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'trade_reference', type: 'text' })
  tradeReference!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'settlement_type', type: 'text' })
  settlementType!: string;

  @Column({ name: 'cycle', type: 'text' })
  cycle!: string;

  @Column({ name: 'settlement_date', type: 'text' })
  settlementDate!: string;

  @Column({ name: 'security_id', type: 'text' })
  securityId!: string;

  @Column({ name: 'quantity', type: 'text', default: '0' })
  quantity!: string;

  @Column({ name: 'amount', type: 'jsonb' })
  amount!: object;

  @Column({ name: 'legs', type: 'jsonb', default: '[]' })
  legs!: object;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'custody_accounts', schema: 'settlement' })
export class CustodyAccountOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'investor_id', type: 'text' })
  investorId!: string;

  @Column({ name: 'custody_type', type: 'text' })
  custodyType!: string;

  @Column({ name: 'custodian_ref', type: 'text' })
  custodianRef!: string;

  @Column({ name: 'holdings', type: 'jsonb', default: '[]' })
  holdings!: object;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
