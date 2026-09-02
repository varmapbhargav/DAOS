import { SubmissionId, TenantId } from '@daos/shared-kernel';

import { Submission } from '../entities/submission.entity';

export interface SubmissionRepository {
  save(submission: Submission): Promise<void>;
  findById(tenantId: TenantId, id: SubmissionId): Promise<Submission | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<Submission[]>;
}
