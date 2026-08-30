import { LegalEntityId, TenantId } from '@daos/shared-kernel';

import { LegalEntity } from '../aggregates/legal-entity.aggregate';

export interface LegalEntityRepository {
  save(entity: LegalEntity): Promise<void>;
  findById(tenantId: TenantId, id: LegalEntityId): Promise<LegalEntity | null>;
  findAll(tenantId: TenantId): Promise<LegalEntity[]>;
}