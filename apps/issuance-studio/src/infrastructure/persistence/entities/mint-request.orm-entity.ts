import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'mint_requests' })
export class MintRequestOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'issuance_id', type: 'uuid' })
  issuanceId!: string;

  @Column({ name: 'amount_minor_units', type: 'text' })
  amountMinorUnits!: string;

  @Column({ name: 'to_address', type: 'text' })
  toAddress!: string;

  @Column({ name: 'status', type: 'text', default: 'pending' })
  status!: string;

  @Column({ name: 'tx_hash', type: 'text', nullable: true })
  txHash!: string | null;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy!: string;

  @Column({ name: 'requested_at', type: 'timestamptz' })
  requestedAt!: string;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}