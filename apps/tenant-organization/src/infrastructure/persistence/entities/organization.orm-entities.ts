import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'tenant_profiles' })
export class TenantProfileOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'org_name', type: 'text' })
  orgName!: string;

  @Column({ name: 'legal_name', type: 'text', default: '' })
  legalName!: string;

  @Column({ name: 'tax_id', type: 'text', default: '' })
  taxId!: string;

  @Column({ type: 'text', default: '' })
  website!: string;

  @Column({ name: 'contact_email', type: 'text', default: '' })
  contactEmail!: string;

  @Column({ name: 'contact_phone', type: 'text', default: '' })
  contactPhone!: string;

  @Column({ type: 'text', default: '' })
  country!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  addresses!: object;

  @Column({ name: 'brand_color', type: 'text', default: '#000000' })
  brandColor!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'custom_domain', type: 'text', nullable: true })
  customDomain!: string | null;

  @Column({ name: 'feature_flags', type: 'jsonb', default: () => "'{}'" })
  featureFlags!: object;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'service_entitlements' })
export class ServiceEntitlementOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'plan_type', type: 'text' })
  planType!: string;

  @Column({ name: 'billing_cycle', type: 'text' })
  billingCycle!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'price_per_seat', type: 'text', default: '0' })
  pricePerSeat!: string;

  @Column({ name: 'payment_method', type: 'jsonb', nullable: true })
  paymentMethod!: object | null;

  @Column({ name: 'usage_limits', type: 'jsonb' })
  usageLimits!: object;

  @Column({ name: 'current_usage', type: 'jsonb' })
  currentUsage!: object;

  @Column({ name: 'next_invoice_date', type: 'text', nullable: true })
  nextInvoiceDate!: string | null;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'api_keys' })
export class ApiKeyOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'text' })
  label!: string;

  @Column({ name: 'key_hash', type: 'text' })
  keyHash!: string;

  @Column({ type: 'text' })
  scope!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'prefix', type: 'text' })
  prefix!: string;

  @Column({ name: 'created_at', type: 'text' })
  createdAt!: string;

  @Column({ name: 'expires_at', type: 'text', nullable: true })
  expiresAt!: string | null;

  @Column({ name: 'last_used_at', type: 'text', nullable: true })
  lastUsedAt!: string | null;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'db_created_at', type: 'timestamptz', default: () => 'NOW()' })
  dbCreatedAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
