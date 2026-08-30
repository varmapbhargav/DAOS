import { TenantId, TermSheetId } from '@daos/shared-kernel';
import { TermSheet } from '../aggregates/term-sheet.aggregate';

export interface TermSheetRepository {
  save(ts: TermSheet): Promise<void>;
  findById(tenantId: TenantId, id: TermSheetId): Promise<TermSheet | null>;
  findByDealId(tenantId: TenantId, dealId: string): Promise<TermSheet | null>;
}
