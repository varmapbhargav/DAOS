import { ApprovalId, TenantId } from '@daos/shared-kernel';

import { ApprovalCase } from '../entities/approval-case.entity';

export interface ApprovalCaseRepository {
  save(approvalCase: ApprovalCase): Promise<void>;
  findById(tenantId: TenantId, id: ApprovalId): Promise<ApprovalCase | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<ApprovalCase | null>;
}