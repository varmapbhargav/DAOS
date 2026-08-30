import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'shareholder_records', schema: 'reporting' })
export class ShareholderRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'cap_table_id', type: 'uuid' })
  capTableId!: string;

  @Column({ name: 'investor_id', type: 'uuid' })
  investorId!: string;

  @Column({ name: 'share_class', type: 'text' })
  shareClass!: string;

  @Column({ name: 'quantity', type: 'bigint', default: 0 })
  quantity!: bigint;

  @Column({ name: 'acquired_at', type: 'timestamptz' })
  acquiredAt!: Date;

  @Column({ name: 'acquisition_price', type: 'numeric' })
  acquisitionPrice!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
