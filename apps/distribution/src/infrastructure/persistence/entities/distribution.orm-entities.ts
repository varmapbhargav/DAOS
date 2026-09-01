import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'subscriptions' })
export class SubscriptionOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'product_id', type: 'text' })
  productId!: string;

  @Index()
  @Column({ name: 'investor_id', type: 'text' })
  investorId!: string;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'requested_amount', type: 'jsonb' })
  requestedAmount!: object;

  @Column({ name: 'allocated_amount', type: 'jsonb', nullable: true })
  allocatedAmount!: object | null;

  @Column({ name: 'allocation_pct', type: 'numeric', nullable: true })
  allocationPct!: number | null;

  @Column({ name: 'payment_ref', type: 'text', nullable: true })
  paymentRef!: string | null;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason!: string | null;

  @Column({ name: 'funded_at', type: 'timestamptz', nullable: true })
  fundedAt!: Date | null;

  @Column({ name: 'received_at', type: 'timestamptz' })
  receivedAt!: Date;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'allocations' })
export class AllocationOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'closing_id', type: 'text' })
  closingId!: string;

  @Index()
  @Column({ name: 'product_id', type: 'text' })
  productId!: string;

  @Column({ name: 'method', type: 'text' })
  method!: string;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'total_amount', type: 'jsonb' })
  totalAmount!: object;

  @Column({ name: 'entries', type: 'jsonb', default: '[]' })
  entries!: object;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'capital_calls' })
export class CapitalCallOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'closing_id', type: 'text' })
  closingId!: string;

  @Index()
  @Column({ name: 'investor_id', type: 'text' })
  investorId!: string;

  @Column({ name: 'amount', type: 'jsonb' })
  amount!: object;

  @Column({ name: 'amount_funded', type: 'jsonb' })
  amountFunded!: object;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'due_date', type: 'text' })
  dueDate!: string;

  @Column({ name: 'funded_at', type: 'timestamptz', nullable: true })
  fundedAt!: Date | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'closings' })
export class ClosingOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'product_id', type: 'text' })
  productId!: string;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'closes_at', type: 'text' })
  closesAt!: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
