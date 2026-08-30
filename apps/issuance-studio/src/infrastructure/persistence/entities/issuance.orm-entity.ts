import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'issuances', schema: 'issuance_studio' })
export class IssuanceOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'instrument_type', type: 'text' })
  instrumentType!: string;

  @Column({ name: 'network', type: 'text' })
  network!: string;

  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: string;

  @Column({ name: 'cap_table_id', type: 'uuid', nullable: true })
  capTableId!: string | null;

  @Column({ name: 'whitelist', type: 'jsonb', default: '[]' })
  whitelist!: object;

  @Column({ name: 'transfer_restrictions', type: 'jsonb', default: '[]' })
  transferRestrictions!: object;

  @Column({ name: 'token_standard', type: 'text', default: 'nativeChain' })
  tokenStandard!: string;

  @Column({ name: 'total_supply_minor_units', type: 'text', nullable: true })
  totalSupplyMinorUnits!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}