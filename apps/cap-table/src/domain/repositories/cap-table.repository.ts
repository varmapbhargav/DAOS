import { CapTable, InitializeCapTableParams } from '../aggregates/cap-table.aggregate';
import { CapTableId, TenantId } from '@daos/shared-kernel';

export interface CapTableRepository {
  save(capTable: CapTable): Promise<void>;
  findById(tenantId: TenantId, capTableId: CapTableId): Promise<CapTable | null>;
  findByIssuanceId(tenantId: TenantId, issuanceId: string): Promise<CapTable | null>;
  findAll(tenantId: TenantId): Promise<CapTable[]>;
}

export type { InitializeCapTableParams };