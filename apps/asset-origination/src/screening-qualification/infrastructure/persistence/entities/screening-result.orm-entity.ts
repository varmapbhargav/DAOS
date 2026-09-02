import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'screening_results' })
export class ScreeningResultOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'decision', type: 'text' })
  decision!: string;

  @Column({ name: 'score', type: 'integer' })
  score!: number;

  @Column({ name: 'max_score', type: 'integer' })
  maxScore!: number;

  @Column({ name: 'criteria', type: 'jsonb', default: '[]' })
  criteria!: Record<string, unknown>[];

  @Column({ name: 'comments', type: 'text', nullable: true })
  comments!: string | null;

  @Column({ name: 'reviewer', type: 'uuid' })
  reviewer!: string;

  @Column({ name: 'reviewed_at', type: 'timestamptz' })
  reviewedAt!: string;

  @Column({ name: 'override_by', type: 'uuid', nullable: true })
  overrideBy!: string | null;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
