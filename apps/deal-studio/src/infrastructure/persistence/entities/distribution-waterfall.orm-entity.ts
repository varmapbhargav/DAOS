import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'distribution_waterfalls', schema: 'deal_studio' })
export class DistributionWaterfallOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'deal_id', type: 'uuid' })
  dealId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'tiers', type: 'jsonb', default: '[]' })
  tiers!: object;

  @Column({ name: 'last_trace', type: 'jsonb', nullable: true })
  lastTrace!: object | null;

  @Column({ name: 'immutable', type: 'boolean', default: false })
  immutable!: boolean;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
