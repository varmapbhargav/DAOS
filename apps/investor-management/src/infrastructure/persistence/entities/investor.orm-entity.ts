import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'investors' })
export class InvestorOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'email', type: 'text' })
  email!: string;

  @Column({ name: 'status', type: 'text', default: 'invited' })
  status!: string;

  @Column({ name: 'profile', type: 'jsonb', default: '{}' })
  profile!: object;

  @Column({ name: 'accreditation_level', type: 'text', nullable: true })
  accreditationLevel!: string | null;

  @Column({ name: 'accreditation_status', type: 'text', default: 'pending' })
  accreditationStatus!: string;

  @Column({ name: 'accreditation_expires_at', type: 'timestamptz', nullable: true })
  accreditationExpiresAt!: string | null;

  @Column({ name: 'kyc_status', type: 'text', default: 'notStarted' })
  kycStatus!: string;

  @Column({ name: 'risk_profile', type: 'jsonb', nullable: true })
  riskProfile!: object | null;

  @Column({ name: 'wallet_addresses', type: 'jsonb', default: '[]' })
  walletAddresses!: string[];

  @Column({ name: 'wallet_ids', type: 'jsonb', default: '[]' })
  walletIds!: string[];

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
