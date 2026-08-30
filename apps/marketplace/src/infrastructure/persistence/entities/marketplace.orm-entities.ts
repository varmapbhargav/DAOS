import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'listings', schema: 'marketplace' })
export class ListingOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'product_id', type: 'text' })
  productId!: string;

  @Column({ name: 'issue_id', type: 'text', nullable: true })
  issueId!: string | null;

  @Column({ name: 'listing_type', type: 'text' })
  listingType!: string;

  @Column({ name: 'mechanism', type: 'text' })
  mechanism!: string;

  @Column({ name: 'currency', type: 'text' })
  currency!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'total_quantity', type: 'text', default: '0' })
  totalQuantity!: string;

  @Column({ name: 'minimum_quantity', type: 'text', default: '0' })
  minimumQuantity!: string;

  @Column({ name: 'reference_price', type: 'jsonb', nullable: true })
  referencePrice!: object | null;

  @Column({ name: 'session', type: 'jsonb', nullable: true })
  session!: object | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'orders', schema: 'marketplace' })
export class OrderOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'listing_id', type: 'text' })
  listingId!: string;

  @Index()
  @Column({ name: 'investor_id', type: 'text' })
  investorId!: string;

  @Column({ name: 'side', type: 'text' })
  side!: string;

  @Column({ name: 'order_type', type: 'text' })
  orderType!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'quantity', type: 'text', default: '0' })
  quantity!: string;

  @Column({ name: 'filled_quantity', type: 'text', default: '0' })
  filledQuantity!: string;

  @Column({ name: 'limit_price', type: 'jsonb', nullable: true })
  limitPrice!: object | null;

  @Column({ name: 'placed_at', type: 'timestamptz' })
  placedAt!: Date;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity({ name: 'trades', schema: 'marketplace' })
export class TradeOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'listing_id', type: 'text' })
  listingId!: string;

  @Column({ name: 'buy_order_id', type: 'text' })
  buyOrderId!: string;

  @Column({ name: 'sell_order_id', type: 'text' })
  sellOrderId!: string;

  @Column({ name: 'quantity', type: 'text', default: '0' })
  quantity!: string;

  @Column({ name: 'price', type: 'jsonb' })
  price!: object;

  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'executed_at', type: 'timestamptz' })
  executedAt!: Date;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
