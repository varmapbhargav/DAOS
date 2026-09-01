import { Column, Entity, Index } from 'typeorm';

import { DocumentVersionOrmRow } from './document-version.orm-row';

@Entity({ name: 'documents' })
export class DocumentOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'file_name', type: 'text' })
  fileName!: string;

  @Column({ name: 'category', type: 'text' })
  category!: string;

  @Column({ name: 'entity_ref', type: 'jsonb' })
  entityRef!: object;

  @Column({ name: 'status', type: 'text', default: 'uploaded' })
  status!: string;

  @Column({ name: 'current_version_number', type: 'integer', default: 1 })
  currentVersionNumber!: number;

  @Column({ name: 'versions', type: 'jsonb', default: '[]' })
  versions!: object;

  @Column({ name: 'uploaded_by', type: 'text' })
  uploadedBy!: string;

  @Column({ name: 'uploaded_at', type: 'timestamptz', default: () => 'NOW()' })
  uploadedAt!: Date;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

export type { DocumentVersionOrmRow };