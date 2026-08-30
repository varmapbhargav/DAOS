import { CorporateDocumentId, TenantId } from '@daos/shared-kernel';

import { CorporateDocument } from '../entities/corporate-document.aggregate';

export interface CorporateDocumentRepository {
  save(document: CorporateDocument): Promise<void>;
  findById(tenantId: TenantId, id: CorporateDocumentId): Promise<CorporateDocument | null>;
  findByEntityId(tenantId: TenantId, entityId: string): Promise<CorporateDocument[]>;
}