import { DocumentId, TenantId } from '@daos/shared-kernel';

import { Document } from '../aggregates/document.aggregate';

export interface DocumentRepository {
  save(document: Document): Promise<void>;
  findById(tenantId: TenantId, documentId: DocumentId): Promise<Document | null>;
  findAll(tenantId: TenantId): Promise<Document[]>;
}