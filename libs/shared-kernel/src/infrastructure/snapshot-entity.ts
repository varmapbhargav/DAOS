import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'aggregate_snapshots' })
export class SnapshotEntity {
  @PrimaryColumn('uuid', { name: 'aggregate_id' })
  aggregateId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'state', type: 'jsonb' })
  state!: object;

  @Column({ name: 'version', type: 'integer' })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
