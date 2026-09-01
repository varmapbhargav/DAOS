import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'closing_conditions' })
export class ClosingConditionOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'category', type: 'text' })
  category!: string;

  @Column({ name: 'condition_type', type: 'text' })
  conditionType!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'responsible_party', type: 'uuid', nullable: true })
  responsibleParty!: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'status', type: 'text', default: 'PENDING' })
  status!: string;

  @Column({ name: 'evidence', type: 'jsonb', nullable: true })
  evidence!: object | null;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
