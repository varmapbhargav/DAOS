import { EntityId, TenantId } from '@daos/shared-kernel';

import { SponsorReference } from '../../domain/entities/sponsor-reference.entity';

export interface SponsorReferenceRepository {
  save(sponsorRef: SponsorReference): Promise<void>;
  findByEntityId(tenantId: TenantId, entityId: EntityId): Promise<SponsorReference | null>;
  findByTenantId(tenantId: TenantId): Promise<SponsorReference[]>;
}