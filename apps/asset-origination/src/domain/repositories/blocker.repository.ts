import { BlockerId, TenantId } from '@daos/shared-kernel';

import { Blocker } from '../entities/blocker.entity';

export interface BlockerRepository {
  save(blocker: Blocker): Promise<void>;
  findById(tenantId: TenantId, id: BlockerId): Promise<Blocker | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<Blocker[]>;
}