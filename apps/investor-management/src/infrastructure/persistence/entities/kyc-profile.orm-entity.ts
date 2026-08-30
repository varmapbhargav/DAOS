import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'kyc_profiles', schema: 'investor_management' })
export class KycProfileOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'investor_id', type: 'uuid' })
  investorId!: string;

  @Column({ name: 'status', type: 'text', default: 'notStarted' })
  status!: string;

  @Column({ name: 'provider_ref', type: 'text', nullable: true })
  providerRef!: string | null;

  @Column({ name: 'documents', type: 'jsonb', default: '[]' })
  documents!: object[];

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: string | null;

  @Column({ name: 'report', type: 'jsonb', nullable: true })
  report!: object | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
