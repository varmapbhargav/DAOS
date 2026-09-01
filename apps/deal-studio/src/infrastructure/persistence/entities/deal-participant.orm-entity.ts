import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'deal_participants' })
export class DealParticipantOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'role', type: 'text' })
  role!: string;

  @Column({ name: 'status', type: 'text', default: 'ACTIVE' })
  status!: string;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo!: string | null;
}
