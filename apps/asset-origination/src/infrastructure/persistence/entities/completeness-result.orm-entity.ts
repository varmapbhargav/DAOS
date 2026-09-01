import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'completeness_results' })
export class CompletenessResultOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'breakdown', type: 'jsonb' })
  breakdown!: Record<string, unknown>;

  @Column({ name: 'calculated_by', type: 'uuid' })
  calculatedBy!: string;

  @Column({ name: 'calculated_at', type: 'timestamptz' })
  calculatedAt!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}