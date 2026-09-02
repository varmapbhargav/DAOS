import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'asset_rights' })
export class AssetRightsOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @Column({ name: 'right_type', type: 'text' })
  rightType!: string;

  @Column({ name: 'holder_entity_id', type: 'uuid', nullable: true })
  holderEntityId!: string | null;

  @Column({ name: 'holder_person_id', type: 'uuid', nullable: true })
  holderPersonId!: string | null;

  @Column({ name: 'percentage', type: 'numeric', nullable: true })
  percentage!: number | null;

  @Column({ name: 'priority', type: 'integer', nullable: true })
  priority!: number | null;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo!: string | null;

  @Column({ name: 'transferable', type: 'boolean', default: true })
  transferable!: boolean;

  @Column({ name: 'assignable', type: 'boolean', default: true })
  assignable!: boolean;

  @Column({ name: 'evidence_references', type: 'jsonb', default: '[]' })
  evidenceReferences!: string[];

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
