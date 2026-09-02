import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'pool_assets', schema: 'asset_origination' })
export class PoolAssetOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'pool_id', type: 'uuid' })
  poolId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'allocation_percentage', type: 'numeric' })
  allocationPercentage!: number;

  @Column({ name: 'added_at', type: 'timestamptz' })
  addedAt!: string;

  @Column({ name: 'removed_at', type: 'timestamptz', nullable: true })
  removedAt!: string | null;

  @Column({ name: 'removal_reason', type: 'text', nullable: true })
  removalReason!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}