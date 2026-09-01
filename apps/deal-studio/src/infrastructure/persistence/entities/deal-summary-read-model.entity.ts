import { Column, Entity, Index } from 'typeorm';
import { ReadModelEntity } from '@daos/shared-kernel';

@Entity({ name: 'deal_summary_read_model' })
export class DealSummaryReadModel extends ReadModelEntity {
  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Index()
  @Column({ name: 'status', type: 'text' })
  status!: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'sponsor_id', type: 'uuid' })
  sponsorId!: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: object | null;

  @Column({ name: 'capital_stack', type: 'jsonb', nullable: true })
  capitalStack!: object | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: string | null;

  @Column({ name: 'participant_count', type: 'integer', default: 0 })
  participantCount!: number;

  @Column({ name: 'document_count', type: 'integer', default: 0 })
  documentCount!: number;
}
