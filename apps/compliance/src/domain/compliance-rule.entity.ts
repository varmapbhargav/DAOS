import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'compliance_rules', schema: 'compliance' })
export class ComplianceRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'rule_type', type: 'text' })
  ruleType!: string;

  @Column({ name: 'jurisdiction', type: 'text' })
  jurisdiction!: string;

  @Column({ name: 'threshold', type: 'numeric', nullable: true })
  threshold?: number;

  @Column({ name: 'parameters', type: 'jsonb', default: '{}' })
  parameters!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
