import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'legal_entities' })
export class LegalEntityOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'legal_name', type: 'text' })
  legalName!: string;

  @Column({ name: 'entity_type', type: 'text' })
  entityType!: string;

  @Column({ name: 'jurisdiction', type: 'text' })
  jurisdiction!: string;

  @Column({ name: 'status', type: 'text', default: 'forming' })
  status!: string;

  @Column({ name: 'registered_agent', type: 'jsonb', nullable: true })
  registeredAgent!: object | null;

  @Column({ name: 'beneficial_owners', type: 'jsonb', default: '[]' })
  beneficialOwners!: object;

  @Column({ name: 'hierarchy', type: 'jsonb', default: '{}' })
  hierarchy!: object;

  @Column({ name: 'document_ids', type: 'jsonb', default: '[]' })
  documentIds!: string[];

  @Column({ name: 'formation_ref', type: 'text', nullable: true })
  formationRef!: string | null;

  @Column({ name: 'dissolution_reason', type: 'text', nullable: true })
  dissolutionReason!: string | null;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
