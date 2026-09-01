import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'corporate_documents' })
export class CorporateDocumentOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'doc_type', type: 'text' })
  docType!: string;

  @Column({ name: 'file_ref', type: 'text' })
  fileRef!: string;

  @Column({ name: 'status', type: 'text', default: 'pending' })
  status!: string;

  @Column({ name: 'signatories', type: 'jsonb', default: '[]' })
  signatories!: object;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
