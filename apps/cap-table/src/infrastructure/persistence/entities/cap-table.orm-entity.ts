import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'cap_tables', schema: 'cap_table' })
export class CapTableOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'issuance_id', type: 'uuid', nullable: true })
  issuanceId!: string | null;

  @Column({ name: 'share_class_id', type: 'text', default: 'common' })
  shareClassId!: string;

  @Column({ name: 'shareholders', type: 'jsonb', default: '[]' })
  shareholders!: object;

  @Column({ name: 'transfer_log', type: 'jsonb', default: '[]' })
  transferLog!: object;

  @Column({ name: 'total_issued_units', type: 'text', default: '0' })
  totalIssuedUnits!: string;

  @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
  syncedAt!: Date | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}