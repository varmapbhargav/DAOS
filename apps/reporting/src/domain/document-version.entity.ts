import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'document_versions', schema: 'reporting' })
export class DocumentVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'version_number', type: 'integer', default: 1 })
  versionNumber!: number;

  @Column({ name: 'file_ref', type: 'text' })
  fileRef!: string;

  @Column({ name: 'checksum', type: 'text' })
  checksum!: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy!: string;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz', default: () => 'NOW()' })
  uploadedAt!: Date;

  @Column({ name: 'mime_type', type: 'text' })
  mimeType!: string;
}
