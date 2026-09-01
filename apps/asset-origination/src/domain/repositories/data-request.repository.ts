import { DataRequestId, TenantId } from '@daos/shared-kernel';

import { DataRequest } from '../entities/data-request.entity';

export interface DataRequestRepository {
  save(request: DataRequest): Promise<void>;
  findById(tenantId: TenantId, id: DataRequestId): Promise<DataRequest | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<DataRequest[]>;
}
