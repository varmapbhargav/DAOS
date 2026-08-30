import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'nav_calculations', schema: 'reporting' })
export class NavCalculationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'share_class_id', type: 'uuid' })
  shareClassId!: string;

  @Column({ name: 'calculation_date', type: 'timestamptz' })
  calculationDate!: Date;

  @Column({ name: 'gross_asset_value', type: 'numeric' })
  grossAssetValue!: number;

  @Column({ name: 'total_liabilities', type: 'numeric' })
  totalLiabilities!: number;

  @Column({ name: 'net_asset_value', type: 'numeric' })
  netAssetValue!: number;

  @Column({ name: 'nav_per_share', type: 'numeric' })
  navPerShare!: number;

  @Column({ name: 'units_outstanding', type: 'bigint' })
  unitsOutstanding!: bigint;

  @Column({ name: 'status', type: 'text', default: 'preliminary' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
