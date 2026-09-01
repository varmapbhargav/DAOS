import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'qualification_results' })
export class QualificationResultOrmEntity {
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

  @Column({ name: 'score', type: 'jsonb' })
  score!: Record<string, unknown>;

  @Column({ name: 'blockers', type: 'jsonb', default: '[]' })
  blockers!: Record<string, unknown>[];

  @Column({ name: 'missing_evidence', type: 'jsonb', default: '[]' })
  missingEvidence!: string[];

  @Column({ name: 'explanation', type: 'text', nullable: true })
  explanation!: string | null;

  @Column({ name: 'qualified_by', type: 'uuid' })
  qualifiedBy!: string;

  @Column({ name: 'qualified_at', type: 'timestamptz' })
  qualifiedAt!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
