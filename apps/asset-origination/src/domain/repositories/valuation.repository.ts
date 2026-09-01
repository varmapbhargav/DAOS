import { TenantId, ValuationId } from '@daos/shared-kernel';

import { Valuation } from '../entities/valuation.entity';

export interface ValuationRepository {
  save(valuation: Valuation): Promise<void>;
  findById(tenantId: TenantId, id: ValuationId): Promise<Valuation | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<Valuation | null>;
  findAllByCaseId(tenantId: TenantId, caseId: string): Promise<Valuation[]>;
}