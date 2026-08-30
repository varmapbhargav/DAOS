import { ShareClassId, TenantId } from '@daos/shared-kernel';

import { ShareClass } from '../entities/share-class.aggregate';

export interface ShareClassRepository {
  save(shareClass: ShareClass): Promise<void>;
  findById(tenantId: TenantId, id: ShareClassId): Promise<ShareClass | null>;
  findByProductId(tenantId: TenantId, productId: string): Promise<ShareClass[]>;
}
